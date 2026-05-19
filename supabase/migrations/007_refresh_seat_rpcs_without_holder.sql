create or replace function public.reserve_seat(
  p_flight_id uuid,
  p_seat_id uuid,
  p_full_name text,
  p_passport_no text,
  p_nationality text,
  p_dob date
)
returns table (
  booking_id uuid,
  pnr_code text,
  total_price numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_price numeric(10,2);
  v_extra_fee numeric(10,2);
  v_booking_id uuid;
  v_pnr text;
  v_total numeric(10,2);
begin
  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  select f.base_price, s.extra_fee
  into v_base_price, v_extra_fee
  from public.flights f
  join public.seats s on s.flight_id = f.id
  where f.id = p_flight_id
    and s.id = p_seat_id
    and s.is_available = true
  for update of s;

  if v_base_price is null then
    raise exception 'Seat is no longer available';
  end if;

  update public.seats
  set is_available = false,
      updated_at = now()
  where id = p_seat_id
    and flight_id = p_flight_id
    and is_available = true;

  if not found then
    raise exception 'Seat is no longer available';
  end if;

  v_total := v_base_price + v_extra_fee;

  insert into public.bookings (user_id, flight_id, seat_id, total_price)
  values (v_user_id, p_flight_id, p_seat_id, v_total)
  returning id, bookings.pnr_code into v_booking_id, v_pnr;

  insert into public.passengers (booking_id, full_name, passport_no, nationality, dob)
  values (v_booking_id, p_full_name, p_passport_no, p_nationality, p_dob);

  return query select v_booking_id, v_pnr, v_total;
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_seat_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  select seat_id into v_seat_id
  from public.bookings
  where id = p_booking_id
    and user_id = v_user_id
    and status <> 'cancelled'
  for update;

  if v_seat_id is null then
    raise exception 'Booking was not found';
  end if;

  update public.bookings
  set status = 'cancelled'
  where id = p_booking_id and user_id = v_user_id;

  update public.seats
  set is_available = true,
      updated_at = now()
  where id = v_seat_id;
end;
$$;

create or replace function public.reschedule_booking(
  p_booking_id uuid,
  p_new_flight_id uuid,
  p_new_seat_id uuid
)
returns table (
  fee_charged numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_old_flight_id uuid;
  v_old_seat_id uuid;
  v_old_price numeric(10,2);
  v_new_price numeric(10,2);
  v_fee numeric(10,2);
begin
  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  select b.flight_id, b.seat_id, b.total_price
  into v_old_flight_id, v_old_seat_id, v_old_price
  from public.bookings b
  join public.flights old_f on old_f.id = b.flight_id
  join public.flights new_f on new_f.id = p_new_flight_id
  where b.id = p_booking_id
    and b.user_id = v_user_id
    and b.status <> 'cancelled'
    and old_f.origin = new_f.origin
    and old_f.destination = new_f.destination
  for update of b;

  if v_old_flight_id is null then
    raise exception 'No same-route booking was found';
  end if;

  select f.base_price + s.extra_fee
  into v_new_price
  from public.flights f
  join public.seats s on s.flight_id = f.id
  where f.id = p_new_flight_id
    and s.id = p_new_seat_id
    and s.is_available = true
  for update of s;

  if v_new_price is null then
    raise exception 'New seat is no longer available';
  end if;

  v_fee := greatest(v_new_price - v_old_price, 0);

  update public.seats
  set is_available = true,
      updated_at = now()
  where id = v_old_seat_id;

  update public.seats
  set is_available = false,
      updated_at = now()
  where id = p_new_seat_id;

  update public.bookings
  set flight_id = p_new_flight_id,
      seat_id = p_new_seat_id,
      status = 'rescheduled',
      total_price = v_new_price
  where id = p_booking_id and user_id = v_user_id;

  insert into public.reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  values (p_booking_id, v_old_flight_id, p_new_flight_id, v_fee);

  return query select v_fee;
end;
$$;
