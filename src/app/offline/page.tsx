import Link from "next/link";

export default function OfflinePage() {
  return (
    <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-slate-950">You are offline</h1>
      <p className="mt-3 text-slate-600">
        Flight search needs a network connection. Recently loaded bookings may still be
        visible from the cached My Bookings screen.
      </p>
      <Link href="/my-bookings" className="mt-5 inline-flex rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white">
        View cached bookings
      </Link>
    </section>
  );
}
