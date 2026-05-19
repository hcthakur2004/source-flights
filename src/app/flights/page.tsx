import Link from "next/link";
import { FlightCard } from "@/components/flight-card";
import { createClient } from "@/lib/supabase/server";
import type { Flight } from "@/lib/types";

type FlightsPageProps = {
  searchParams: Promise<{
    origin?: string;
    destination?: string;
    date?: string;
    passengers?: string;
  }>;
};

export default async function FlightsPage({ searchParams }: FlightsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("flights")
    .select("*")
    .neq("status", "cancelled")
    .order("departs_at", { ascending: true });

  if (params.origin) query = query.eq("origin", params.origin);
  if (params.destination) query = query.eq("destination", params.destination);
  if (params.date) {
    const start = new Date(`${params.date}T00:00:00`);
    const end = new Date(`${params.date}T23:59:59`);
    query = query.gte("departs_at", start.toISOString()).lte("departs_at", end.toISOString());
  }

  const { data, error } = await query;
  const flights = (data ?? []) as Flight[];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Available Flights</h1>
          <p className="mt-2 text-slate-600">
            {params.origin && params.destination
              ? `${params.origin} to ${params.destination}`
              : "All scheduled flights"}
          </p>
        </div>
        <Link href="/" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          Edit search
        </Link>
      </div>

      {error ? (
        <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error.message}</p>
      ) : null}

      {flights.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">No flights found</h2>
          <p className="mt-2 text-sm text-slate-500">Try another route or clear the date filter.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}
    </div>
  );
}
