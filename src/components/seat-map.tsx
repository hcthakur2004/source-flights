"use client";

import { useEffect, useMemo, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Seat } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useFlightStore } from "@/lib/stores/use-flight-store";
import { formatMoney } from "@/lib/format";

type SeatMapProps = {
  flightId: string;
  initialSeats: Seat[];
};

const columns = ["A", "B", "C", "D", "E", "F"];

export function SeatMap({ flightId, initialSeats }: SeatMapProps) {
  const [seats, setSeats] = useState(initialSeats);
  const passengerCount = useFlightStore((state) => state.searchQuery.passengers);
  const selectedSeats = useFlightStore((state) => state.selectedSeats);
  const toggleSelectedSeat = useFlightStore((state) => state.toggleSelectedSeat);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`seats:${flightId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "seats",
          filter: `flight_id=eq.${flightId}`,
        },
        (payload: RealtimePostgresChangesPayload<Seat>) => {
          const nextSeat = payload.new as Seat;
          if (!nextSeat?.id) return;
          setSeats((current) => current.map((seat) => (seat.id === nextSeat.id ? nextSeat : seat)));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [flightId]);

  const rows = useMemo(() => {
    const rowNumbers = Array.from(
      new Set(seats.map((seat) => Number.parseInt(seat.seat_number, 10))),
    ).sort((a, b) => a - b);

    return rowNumbers.map((row) => ({
      row,
      seats: columns.map((column) =>
        seats.find((seat) => seat.seat_number === `${row}${column}`),
      ),
    }));
  }, [seats]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Select seats</h2>
          <p className="text-sm text-slate-500">
            Choose {passengerCount} {passengerCount === 1 ? "seat" : "seats"} for your passengers. Live availability updates when other users book.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <Legend color="bg-white ring-slate-300" label="Available" />
          <Legend color="bg-teal-600 ring-teal-600" label="Selected" />
          <Legend color="bg-slate-300 ring-slate-300" label="Occupied" />
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="mx-auto min-w-[420px] max-w-xl rounded-t-[56px] border border-slate-200 bg-gradient-to-b from-slate-100 to-white px-4 py-6">
          <div className="mx-auto mb-2 h-2 w-28 rounded-full bg-slate-300" />
          <div className="mb-5 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
            Front cabin
          </div>
          <div className="grid gap-2">
            {rows.map(({ row, seats: rowSeats }) => (
              <div
                key={row}
                className="grid grid-cols-[28px_repeat(3,44px)_24px_repeat(3,44px)] items-center gap-2"
              >
                <span className="text-center text-xs font-semibold text-slate-400">{row}</span>
                {rowSeats.map((seat, index) => {
                  if (!seat) return <span key={`${row}-${index}`} />;
                  const isSelected = selectedSeats.some((selectedSeat) => selectedSeat.id === seat.id);
                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={!seat.is_available}
                      title={`${seat.seat_number} - ${seat.class} - ${formatMoney(seat.extra_fee)} extra`}
                      onClick={() => toggleSelectedSeat(seat, passengerCount)}
                      className={`h-10 rounded-md text-xs font-bold ring-1 transition ${
                        isSelected
                          ? "bg-teal-600 text-white ring-teal-700"
                          : seat.is_available
                            ? zoneStyle(seat.class)
                            : "cursor-not-allowed bg-slate-300 text-slate-500 ring-slate-300"
                      } ${index === 2 ? "mr-6" : ""}`}
                    >
                      {seat.seat_number}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ring-1 ${color}`} />
      {label}
    </span>
  );
}

function zoneStyle(seatClass: Seat["class"]) {
  if (seatClass === "first") {
    return "bg-amber-50 text-amber-800 ring-amber-300 hover:bg-amber-100";
  }
  if (seatClass === "business") {
    return "bg-sky-50 text-sky-800 ring-sky-300 hover:bg-sky-100";
  }
  return "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100";
}
