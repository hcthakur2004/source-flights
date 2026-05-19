insert into public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
values
  ('SA101', 'Delhi', 'Mumbai', now() + interval '1 day 4 hours', now() + interval '1 day 6 hours 10 minutes', 'Airbus A320', 'scheduled', 5200),
  ('SA102', 'Delhi', 'Mumbai', now() + interval '2 days 3 hours', now() + interval '2 days 5 hours 15 minutes', 'Boeing 737', 'scheduled', 5600),
  ('SA201', 'Mumbai', 'Bengaluru', now() + interval '1 day 7 hours', now() + interval '1 day 8 hours 45 minutes', 'Airbus A320neo', 'scheduled', 4300),
  ('SA202', 'Mumbai', 'Bengaluru', now() + interval '3 days 2 hours', now() + interval '3 days 3 hours 50 minutes', 'Airbus A321', 'scheduled', 4700),
  ('SA301', 'Bengaluru', 'Hyderabad', now() + interval '1 day 5 hours', now() + interval '1 day 6 hours 20 minutes', 'ATR 72', 'scheduled', 3100),
  ('SA302', 'Bengaluru', 'Hyderabad', now() + interval '2 days 8 hours', now() + interval '2 days 9 hours 15 minutes', 'Airbus A320', 'scheduled', 3400),
  ('SA401', 'Hyderabad', 'Chennai', now() + interval '1 day 10 hours', now() + interval '1 day 11 hours 20 minutes', 'Boeing 737', 'scheduled', 2900),
  ('SA402', 'Hyderabad', 'Chennai', now() + interval '3 days 6 hours', now() + interval '3 days 7 hours 25 minutes', 'Airbus A320neo', 'scheduled', 3200)
on conflict (flight_no) do nothing;

insert into public.seats (flight_id, seat_number, class, extra_fee)
select f.id, seat_number,
  case
    when row_no <= 2 then 'first'
    when row_no <= 5 then 'business'
    else 'economy'
  end as class,
  case
    when row_no <= 2 then 3500
    when row_no <= 5 then 1800
    else 0
  end as extra_fee
from public.flights f
cross join generate_series(1, 18) row_no
cross join unnest(array['A','B','C','D','E','F']) col
cross join lateral (select row_no::text || col as seat_number) s
on conflict (flight_id, seat_number) do nothing;
