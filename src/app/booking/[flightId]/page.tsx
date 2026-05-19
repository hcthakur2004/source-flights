import { notFound } from "next/navigation";
import { BookingClient } from "@/components/booking-client";
import { createClient } from "@/lib/supabase/server";
import type { Flight, Seat } from "@/lib/types";

type BookingPageProps = {
  params: Promise<{ flightId: string }>;
};

export default async function BookingPage({ params }: BookingPageProps) {
  const { flightId } = await params;
  const supabase = await createClient();
  const [{ data: flight }, { data: seats }] = await Promise.all([
    supabase.from("flights").select("*").eq("id", flightId).single(),
    supabase.from("seats").select("*").eq("flight_id", flightId).order("seat_number", { ascending: true }),
  ]);

  if (!flight) {
    notFound();
  }

  return <BookingClient flight={flight as Flight} seats={(seats ?? []) as Seat[]} />;
}
