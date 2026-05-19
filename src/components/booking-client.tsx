"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
  const selectedSeat = useFlightStore((state) => state.selectedSeat);
  const passenger = useFlightStore((state) => state.passenger);
  const setPassenger = useFlightStore((state) => state.setPassenger);
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);
  const resetBooking = useFlightStore((state) => state.resetBooking);

  useEffect(() => {
    setSelectedFlight(flight);
  }, [flight, setSelectedFlight]);

  const total = flight.base_price + (selectedSeat?.extra_fee ?? 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedSeat) {
      setError("Select a seat before confirming the booking.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      router.push("/login");
      return;
    }

    const { data, error: rpcError } = await supabase.rpc("reserve_seat", {
      p_flight_id: flight.id,
      p_seat_id: selectedSeat.id,
      p_full_name: passenger.fullName,
      p_passport_no: passenger.passportNo,
      p_nationality: passenger.nationality,
      p_dob: passenger.dob,
    });

    setIsSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    const bookingId = data?.[0]?.booking_id as string | undefined;
    resetBooking();
    router.push(`/confirmation/${bookingId ?? ""}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <SeatMap flightId={flight.id} initialSeats={seats} />

      <aside className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{flight.flight_no}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            {flight.origin} to {flight.destination}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{formatDateTime(flight.departs_at)}</p>
          <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
            <div className="flex justify-between">
              <span>Base fare</span>
              <span>{formatMoney(flight.base_price)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>Seat fee</span>
              <span>{formatMoney(selectedSeat?.extra_fee ?? 0)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-bold text-slate-950">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Passenger details</h2>
          <div className="mt-4 grid gap-3">
            <Field label="Full name" value={passenger.fullName} onChange={(value) => setPassenger({ ...passenger, fullName: value })} />
            <Field label="Passport number" value={passenger.passportNo} onChange={(value) => setPassenger({ ...passenger, passportNo: value })} />
            <Field label="Nationality" value={passenger.nationality} onChange={(value) => setPassenger({ ...passenger, nationality: value })} />
            <Field label="Date of birth" type="date" value={passenger.dob} onChange={(value) => setPassenger({ ...passenger, dob: value })} />
          </div>

          {error ? <p className="mt-3 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || !selectedSeat || !isPassengerReady(passenger)}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={17} /> : null}
            Confirm booking
          </button>
        </form>
      </aside>
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
