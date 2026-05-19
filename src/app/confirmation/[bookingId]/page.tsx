"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { BookingWithDetails } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, formatMoney } from "@/lib/format";

type ConfirmationPageProps = {
  params: Promise<{ bookingId: string }>;
};

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ bookingId: id }) => setBookingId(id));
  }, [params]);

  useEffect(() => {
    if (!bookingId) return;
    const supabase = createClient();
    supabase
      .from("bookings")
      .select("id,status,booked_at,total_price,pnr_code,flight:flights(*),seat:seats(*),passengers(*)")
      .eq("id", bookingId)
      .single()
      .then(({ data, error: bookingError }) => {
        if (bookingError) {
          setError(bookingError.message);
        } else {
          setBooking(data as unknown as BookingWithDetails);
        }
      });
  }, [bookingId]);

  if (error) {
    return <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>;
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={18} />
        Loading confirmation
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="text-teal-600" size={32} />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Booking confirmed</p>
          <h1 className="text-3xl font-bold text-slate-950">PNR {booking.pnr_code}</h1>
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-md bg-slate-50 p-4 sm:grid-cols-2">
        <Detail label="Route" value={`${booking.flight.origin} to ${booking.flight.destination}`} />
        <Detail label="Flight" value={`${booking.flight.flight_no} · ${booking.flight.aircraft_type}`} />
        <Detail label="Departure" value={formatDateTime(booking.flight.departs_at)} />
        <Detail label="Seat" value={`${booking.seat.seat_number} · ${booking.seat.class}`} />
        <Detail label="Passenger" value={booking.passengers[0]?.full_name ?? "Passenger"} />
        <Detail label="Total paid" value={formatMoney(booking.total_price)} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/my-bookings" className="inline-flex h-10 items-center justify-center rounded-md bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700">
          View my bookings
        </Link>
        <Link href="/" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          Book another flight
        </Link>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-950">{value}</p>
    </div>
  );
}
