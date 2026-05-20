"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, Plane, ShieldCheck } from "lucide-react";
import type { Flight, PassengerDraft, Seat } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, formatMoney } from "@/lib/format";
import { useFlightStore } from "@/lib/stores/use-flight-store";
import { SeatMap } from "@/components/seat-map";

type BookingClientProps = {
  flight: Flight;
  seats: Seat[];
};

export function BookingClient({ flight, seats }: BookingClientProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passengerCount = useFlightStore((state) => state.searchQuery.passengers);
  const selectedSeats = useFlightStore((state) => state.selectedSeats);
  const passengers = useFlightStore((state) => state.passengers);
  const setPassengerAt = useFlightStore((state) => state.setPassengerAt);
  const syncPassengerCount = useFlightStore((state) => state.syncPassengerCount);
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);
  const resetBooking = useFlightStore((state) => state.resetBooking);

  useEffect(() => {
    setSelectedFlight(flight);
    syncPassengerCount(passengerCount);
  }, [flight, passengerCount, setSelectedFlight, syncPassengerCount]);

  const selectedSeatFees = selectedSeats.reduce((sum, seat) => sum + seat.extra_fee, 0);
  const total = flight.base_price * passengerCount + selectedSeatFees;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (selectedSeats.length !== passengerCount) {
      setError(`Select ${passengerCount} ${passengerCount === 1 ? "seat" : "seats"} before confirming.`);
      return;
    }

    if (!passengers.every(isPassengerReady)) {
      setError("Complete passenger details for every traveler before confirming.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      setIsSubmitting(false);
      router.push("/login");
      return;
    }

    const bookingIds: string[] = [];

    for (let index = 0; index < passengerCount; index += 1) {
      const passenger = passengers[index];
      const seat = selectedSeats[index];
      const { data, error: rpcError } = await supabase.rpc("reserve_seat", {
        p_flight_id: flight.id,
        p_seat_id: seat.id,
        p_full_name: passenger.fullName,
        p_passport_no: passenger.passportNo,
        p_nationality: passenger.nationality,
        p_dob: passenger.dob,
      });

      if (rpcError) {
        setIsSubmitting(false);
        setError(
          `${rpcError.message}. ${
            bookingIds.length > 0
              ? `${bookingIds.length} booking(s) were created before this failed. Check My Bookings.`
              : "Refresh seat availability or choose another seat."
          }`,
        );
        return;
      }

      const bookingId = data?.[0]?.booking_id as string | undefined;
      if (bookingId) bookingIds.push(bookingId);
    }

    setIsSubmitting(false);
    resetBooking();
    router.push(passengerCount === 1 ? `/confirmation/${bookingIds[0] ?? ""}` : "/my-bookings");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <SeatMap flightId={flight.id} initialSeats={seats} />

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-950 p-4 text-white">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-teal-200">
              <Plane size={16} />
              {flight.flight_no}
            </p>
            <h1 className="mt-2 text-2xl font-bold">
              {flight.origin} to {flight.destination}
            </h1>
            <p className="mt-2 text-sm text-slate-300">{formatDateTime(flight.departs_at)}</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <Step active label="Flight" />
              <Step active={selectedSeats.length === passengerCount} label="Seats" />
              <Step active={passengers.every(isPassengerReady)} label="Passengers" />
            </div>
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>Base fare</span>
                <span>{formatMoney(flight.base_price)} x {passengerCount}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Seat fees</span>
                <span>{formatMoney(selectedSeatFees)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-bold text-slate-950">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Passenger details</h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter details for {passengerCount} {passengerCount === 1 ? "traveler" : "travelers"}.
              </p>
            </div>
            <ShieldCheck className="text-teal-600" size={22} />
          </div>

          <div className="mt-4 grid gap-4">
            {passengers.map((passenger, index) => (
              <div key={index} className="rounded-md border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-950">Passenger {index + 1}</h3>
                  <span className="text-xs font-semibold text-slate-500">
                    Seat {selectedSeats[index]?.seat_number ?? "not selected"}
                  </span>
                </div>
                <div className="grid gap-3">
                  <Field label="Full name" value={passenger.fullName} onChange={(value) => setPassengerAt(index, { ...passenger, fullName: value })} />
                  <Field label="Passport number" value={passenger.passportNo} onChange={(value) => setPassengerAt(index, { ...passenger, passportNo: value })} />
                  <Field label="Nationality" value={passenger.nationality} onChange={(value) => setPassengerAt(index, { ...passenger, nationality: value })} />
                  <Field label="Date of birth" type="date" value={passenger.dob} onChange={(value) => setPassengerAt(index, { ...passenger, dob: value })} />
                </div>
              </div>
            ))}
          </div>

          {selectedSeats.length > 0 ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
              <BadgeCheck size={16} />
              {selectedSeats.length}/{passengerCount} seats selected
            </p>
          ) : null}

          {error ? <p className="mt-3 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || selectedSeats.length !== passengerCount || !passengers.every(isPassengerReady)}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={17} /> : null}
            Confirm {passengerCount} {passengerCount === 1 ? "booking" : "bookings"}
          </button>
        </form>
      </aside>
    </div>
  );
}

function Step({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`rounded-md px-2 py-2 font-semibold ${active ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
      {label}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-teal-600"
      />
    </label>
  );
}

function isPassengerReady(passenger: PassengerDraft) {
  return Boolean(passenger.fullName && passenger.passportNo && passenger.nationality && passenger.dob);
}
