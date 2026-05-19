"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw, XCircle } from "lucide-react";
import type { BookingWithDetails, Flight } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { useUserStore } from "@/lib/stores/use-user-store";
import { useFlightStore } from "@/lib/stores/use-flight-store";

export function MyBookingsClient() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const cachedBookings = useUserStore((state) => state.cachedBookings);
  const setCachedBookings = useUserStore((state) => state.setCachedBookings);
  const resetBooking = useFlightStore((state) => state.resetBooking);

  useEffect(() => {
    void loadBookings();
    async function loadBookings() {
      const supabase = createClient();
      const [{ data: bookingData, error: bookingsError }, { data: flightData }] = await Promise.all([
        supabase
          .from("bookings")
          .select("id,status,booked_at,total_price,pnr_code,flight:flights(*),seat:seats(*),passengers(*)")
          .order("booked_at", { ascending: false }),
        supabase.from("flights").select("*").order("departs_at", { ascending: true }),
      ]);

      if (bookingsError) {
        setError(bookingsError.message);
        setBookings(cachedBookings);
      } else {
        const typedBookings = (bookingData ?? []) as unknown as BookingWithDetails[];
        setBookings(typedBookings);
        setCachedBookings(typedBookings);
      }

      setFlights((flightData ?? []) as Flight[]);
      setIsLoading(false);
    }
  }, [cachedBookings, setCachedBookings]);

  async function cancelBooking(bookingId: string) {
    if (!window.confirm("Cancel this booking? This action will free the selected seat.")) return;
    setBusyId(bookingId);
    setError("");
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("cancel_booking", { p_booking_id: bookingId });
    setBusyId("");

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    resetBooking();
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId ? { ...booking, status: "cancelled" } : booking,
      ),
    );
  }

  async function rescheduleBooking(booking: BookingWithDetails, newFlightId: string) {
    const newFlight = flights.find((flight) => flight.id === newFlightId);
    if (!newFlight) return;

    if (!window.confirm(`Reschedule to ${newFlight.flight_no}? A fare difference may apply.`)) return;

    setBusyId(booking.id);
    setError("");
    const supabase = createClient();

    const { data: seats } = await supabase
      .from("seats")
      .select("*")
      .eq("flight_id", newFlightId)
      .eq("is_available", true)
      .order("seat_number", { ascending: true })
      .limit(1);

    const nextSeatId = seats?.[0]?.id;
    if (!nextSeatId) {
      setBusyId("");
      setError("No available seat was found on the selected flight.");
      return;
    }

    const { error: rpcError } = await supabase.rpc("reschedule_booking", {
      p_booking_id: booking.id,
      p_new_flight_id: newFlightId,
      p_new_seat_id: nextSeatId,
    });
    setBusyId("");

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    window.location.reload();
  }

  const sameRouteFlights = useMemo(
    () => (booking: BookingWithDetails) =>
      flights.filter(
        (flight) =>
          flight.id !== booking.flight.id &&
          flight.origin === booking.flight.origin &&
          flight.destination === booking.flight.destination,
      ),
    [flights],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={18} />
        Loading bookings
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">My Bookings</h1>
        <p className="mt-2 text-slate-600">Manage confirmed trips, cancellations, and same-route reschedules.</p>
      </div>

      {error ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      {bookings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">No bookings yet</h2>
          <p className="mt-2 text-sm text-slate-500">Search flights and reserve a seat to see it here.</p>
          <Link href="/" className="mt-4 inline-flex rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white">
            Search flights
          </Link>
        </div>
      ) : (
        bookings.map((booking) => (
          <article key={booking.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-950">PNR {booking.pnr_code}</span>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {booking.flight.origin} to {booking.flight.destination}
                </p>
                <p className="text-sm text-slate-500">
                  {booking.flight.flight_no} - Seat {booking.seat.seat_number} - {formatDateTime(booking.flight.departs_at)}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">{formatMoney(booking.total_price)}</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  disabled={booking.status === "cancelled" || busyId === booking.id}
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value) void rescheduleBooking(booking, event.target.value);
                  }}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 disabled:bg-slate-100"
                >
                  <option value="">Reschedule</option>
                  {sameRouteFlights(booking).map((flight) => (
                    <option key={flight.id} value={flight.id}>
                      {flight.flight_no} - {formatDateTime(flight.departs_at)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={booking.status === "cancelled" || busyId === booking.id}
                  onClick={() => void cancelBooking(booking.id)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-rose-200 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                >
                  {busyId === booking.id ? <RefreshCw className="animate-spin" size={16} /> : <XCircle size={16} />}
                  Cancel
                </button>
              </div>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
