import Link from "next/link";
import { ArrowRight, Clock3, Plane, Sparkles } from "lucide-react";
import type { Flight } from "@/lib/types";
import { formatDuration, formatMoney, formatTime } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export function FlightCard({ flight }: { flight: Flight }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-200/80">
      <div className="h-1 bg-gradient-to-r from-teal-500 via-sky-500 to-amber-400" />
      <div className="p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 font-semibold text-slate-950">
              <Plane size={17} className="text-teal-600" />
              {flight.flight_no}
            </span>
            <StatusBadge status={flight.status} />
            <span className="text-sm text-slate-500">{flight.aircraft_type}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
              <Sparkles size={13} />
              {flight.base_price < 4000 ? "Value fare" : "Flexible fare"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-950">
            <div>
              <p className="text-xl font-semibold">{formatTime(flight.departs_at)}</p>
              <p className="text-sm text-slate-500">{flight.origin}</p>
            </div>
            <div className="flex min-w-24 flex-col items-center text-slate-400">
              <ArrowRight size={18} />
              <span className="inline-flex items-center gap-1 text-xs">
                <Clock3 size={13} />
                {formatDuration(flight.departs_at, flight.arrives_at)}
              </span>
            </div>
            <div>
              <p className="text-xl font-semibold">{formatTime(flight.arrives_at)}</p>
              <p className="text-sm text-slate-500">{flight.destination}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">From</p>
            <p className="text-xl font-bold text-slate-950">{formatMoney(flight.base_price)}</p>
          </div>
          <Link
            href={`/booking/${flight.id}`}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Select
          </Link>
        </div>
      </div>
      </div>
    </article>
  );
}
