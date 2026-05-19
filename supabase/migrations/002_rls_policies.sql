alter table public.flights enable row level security;
alter table public.seats enable row level security;
alter table public.bookings enable row level security;
alter table public.passengers enable row level security;
alter table public.reschedules enable row level security;

create policy "Flights are readable by everyone"
on public.flights for select
using (true);

create policy "Seats are readable by everyone"
on public.seats for select
using (true);

create policy "Users can read own bookings"
on public.bookings for select
using (auth.uid() = user_id);

create policy "Users can insert own bookings"
on public.bookings for insert
with check (auth.uid() = user_id);

create policy "Users can update own bookings"
on public.bookings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read own passengers"
on public.passengers for select
using (
  exists (
    select 1 from public.bookings b
    where b.id = passengers.booking_id and b.user_id = auth.uid()
  )
);

create policy "Users can insert passengers for own bookings"
on public.passengers for insert
with check (
  exists (
    select 1 from public.bookings b
    where b.id = passengers.booking_id and b.user_id = auth.uid()
  )
);

create policy "Users can read own reschedules"
on public.reschedules for select
using (
  exists (
    select 1 from public.bookings b
    where b.id = reschedules.booking_id and b.user_id = auth.uid()
  )
);

create policy "Users can insert reschedules for own bookings"
on public.reschedules for insert
with check (
  exists (
    select 1 from public.bookings b
    where b.id = reschedules.booking_id and b.user_id = auth.uid()
  )
);
