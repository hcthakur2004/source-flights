"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Search, UsersRound } from "lucide-react";
import { FormEvent } from "react";
import { useFlightStore } from "@/lib/stores/use-flight-store";

const cities = ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai"];

export function FlightSearchForm() {
  const router = useRouter();
  const searchQuery = useFlightStore((state) => state.searchQuery);
  const setSearchQuery = useFlightStore((state) => state.setSearchQuery);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({
      origin: searchQuery.origin,
      destination: searchQuery.destination,
      date: searchQuery.date,
      passengers: String(searchQuery.passengers),
    });
    router.push(`/flights?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 md:grid-cols-[1fr_1fr_1fr_140px_auto]">
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        From
        <select
          value={searchQuery.origin}
          onChange={(event) => setSearchQuery({ ...searchQuery, origin: event.target.value })}
          className="h-12 rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
        >
          {cities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm font-medium text-slate-700">
        To
        <select
          value={searchQuery.destination}
          onChange={(event) => setSearchQuery({ ...searchQuery, destination: event.target.value })}
          className="h-12 rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
        >
          {cities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm font-medium text-slate-700">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={15} />
          Date
        </span>
        <input
          type="date"
          value={searchQuery.date}
          onChange={(event) => setSearchQuery({ ...searchQuery, date: event.target.value })}
          className="h-12 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium text-slate-700">
        <span className="inline-flex items-center gap-1.5">
          <UsersRound size={15} />
          Passengers
        </span>
        <input
          min={1}
          max={6}
          type="number"
          value={searchQuery.passengers}
          onChange={(event) =>
            setSearchQuery({ ...searchQuery, passengers: Number(event.target.value) })
          }
          className="h-12 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
        />
      </label>

      <button
        type="submit"
        className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-600 px-5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700"
      >
        <Search size={17} />
        Search
      </button>
    </form>
  );
}
