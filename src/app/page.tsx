import { ArrowRight, MapPin, PlaneTakeoff } from "lucide-react";
import { FlightSearchForm } from "@/components/flight-search-form";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Flight Management PWA
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Book reliable flights with live seat availability.
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              A production-style booking flow with Supabase Auth, atomic seat reservation,
              realtime cabin updates, persisted booking state, and responsive trip management.
            </p>
          </div>
          <div className="network-panel rounded-lg p-5">
            <div className="network-panel-divider flex items-center justify-between border-b pb-4">
              <span className="network-panel-label text-sm font-semibold text-slate-700">Today&apos;s network</span>
              <span className="network-panel-badge rounded-full px-2.5 py-1 text-xs font-semibold">
                Live
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Metric value="34" label="Flights" />
              <Metric value="10" label="Routes" />
              <Metric value="3" label="Cabin classes" />
              <Metric value="108" label="Seats per flight" />
            </div>
          </div>
        </div>
      </section>

      <FlightSearchForm />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Popular routes</h2>
            <p className="text-sm text-slate-600">Fast routes with multiple daily departures.</p>
          </div>
          <MapPin className="text-teal-600" size={22} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <RouteCard from="Delhi" to="Mumbai" fare="from ₹5,200" timing="Morning, evening" />
          <RouteCard from="Bengaluru" to="Hyderabad" fare="from ₹3,100" timing="Short-haul" />
          <RouteCard from="Mumbai" to="Bengaluru" fare="from ₹4,300" timing="Business route" />
        </div>
      </section>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="network-panel-value text-3xl font-bold text-slate-950">{value}</p>
      <p className="network-panel-label mt-1 text-sm text-slate-600">{label}</p>
    </div>
  );
}

function RouteCard({
  from,
  to,
  fare,
  timing,
}: {
  from: string;
  to: string;
  fare: string;
  timing: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-200/70">
      <div className="mb-5 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-teal-700">
          <PlaneTakeoff size={20} />
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {timing}
        </span>
      </div>
      <div className="flex items-center gap-3 text-slate-950">
        <span className="text-lg font-bold">{from}</span>
        <ArrowRight size={17} className="text-slate-400" />
        <span className="text-lg font-bold">{to}</span>
      </div>
      <p className="mt-3 text-sm font-semibold text-teal-700">{fare}</p>
    </article>
  );
}
