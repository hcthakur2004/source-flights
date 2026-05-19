insert into public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
values
  ('SA103', 'Delhi', 'Mumbai', now() + interval '4 days 7 hours', now() + interval '4 days 9 hours 10 minutes', 'Airbus A321neo', 'scheduled', 6100),
  ('SA104', 'Delhi', 'Mumbai', now() + interval '5 days 2 hours', now() + interval '5 days 4 hours 5 minutes', 'Boeing 737 MAX 8', 'delayed', 5850),
  ('SA203', 'Mumbai', 'Bengaluru', now() + interval '4 days 4 hours', now() + interval '4 days 5 hours 45 minutes', 'Airbus A320neo', 'scheduled', 4550),
  ('SA204', 'Mumbai', 'Bengaluru', now() + interval '5 days 9 hours', now() + interval '5 days 10 hours 50 minutes', 'Boeing 737', 'scheduled', 4950),
  ('SA303', 'Bengaluru', 'Hyderabad', now() + interval '4 days 6 hours', now() + interval '4 days 7 hours 20 minutes', 'ATR 72', 'scheduled', 3250),
  ('SA304', 'Bengaluru', 'Hyderabad', now() + interval '5 days 11 hours', now() + interval '5 days 12 hours 15 minutes', 'Airbus A320', 'boarding', 3650),
  ('SA403', 'Hyderabad', 'Chennai', now() + interval '4 days 8 hours', now() + interval '4 days 9 hours 20 minutes', 'Boeing 737', 'scheduled', 3050),
  ('SA404', 'Hyderabad', 'Chennai', now() + interval '5 days 5 hours', now() + interval '5 days 6 hours 25 minutes', 'Airbus A320neo', 'scheduled', 3350),
  ('SA501', 'Delhi', 'Bengaluru', now() + interval '1 day 9 hours', now() + interval '1 day 11 hours 45 minutes', 'Airbus A321neo', 'scheduled', 6900),
  ('SA502', 'Delhi', 'Bengaluru', now() + interval '2 days 12 hours', now() + interval '2 days 14 hours 40 minutes', 'Boeing 737 MAX 8', 'scheduled', 7200),
  ('SA503', 'Delhi', 'Bengaluru', now() + interval '4 days 1 hours', now() + interval '4 days 3 hours 40 minutes', 'Airbus A320neo', 'delayed', 6650),
  ('SA601', 'Bengaluru', 'Chennai', now() + interval '1 day 3 hours', now() + interval '1 day 4 hours 5 minutes', 'ATR 72', 'scheduled', 2800),
  ('SA602', 'Bengaluru', 'Chennai', now() + interval '2 days 7 hours', now() + interval '2 days 8 hours 10 minutes', 'Airbus A320', 'scheduled', 3150),
  ('SA603', 'Bengaluru', 'Chennai', now() + interval '4 days 10 hours', now() + interval '4 days 11 hours 10 minutes', 'Airbus A320neo', 'scheduled', 3400),
  ('SA701', 'Mumbai', 'Delhi', now() + interval '1 day 12 hours', now() + interval '1 day 14 hours 15 minutes', 'Airbus A320', 'scheduled', 5400),
  ('SA702', 'Mumbai', 'Delhi', now() + interval '3 days 8 hours', now() + interval '3 days 10 hours 20 minutes', 'Boeing 737', 'scheduled', 5750),
  ('SA703', 'Mumbai', 'Delhi', now() + interval '5 days 6 hours', now() + interval '5 days 8 hours 5 minutes', 'Airbus A321', 'scheduled', 6200),
  ('SA801', 'Chennai', 'Hyderabad', now() + interval '1 day 6 hours', now() + interval '1 day 7 hours 30 minutes', 'Airbus A320neo', 'scheduled', 3300),
  ('SA802', 'Chennai', 'Hyderabad', now() + interval '2 days 5 hours', now() + interval '2 days 6 hours 25 minutes', 'Boeing 737', 'scheduled', 3450),
  ('SA803', 'Chennai', 'Hyderabad', now() + interval '4 days 12 hours', now() + interval '4 days 13 hours 25 minutes', 'Airbus A320', 'delayed', 3600),
  ('SA901', 'Delhi', 'Hyderabad', now() + interval '1 day 8 hours', now() + interval '1 day 10 hours 15 minutes', 'Boeing 737 MAX 8', 'scheduled', 6100),
  ('SA902', 'Delhi', 'Hyderabad', now() + interval '3 days 3 hours', now() + interval '3 days 5 hours 10 minutes', 'Airbus A321neo', 'scheduled', 6500),
  ('SA903', 'Delhi', 'Hyderabad', now() + interval '5 days 10 hours', now() + interval '5 days 12 hours 20 minutes', 'Airbus A320neo', 'scheduled', 6750),
  ('SA1001', 'Hyderabad', 'Bengaluru', now() + interval '1 day 2 hours', now() + interval '1 day 3 hours 10 minutes', 'ATR 72', 'scheduled', 3000),
  ('SA1002', 'Hyderabad', 'Bengaluru', now() + interval '2 days 9 hours', now() + interval '2 days 10 hours 20 minutes', 'Airbus A320', 'scheduled', 3350),
  ('SA1003', 'Hyderabad', 'Bengaluru', now() + interval '4 days 5 hours', now() + interval '4 days 6 hours 15 minutes', 'Airbus A320neo', 'scheduled', 3550)
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
