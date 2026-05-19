import type { BookingStatus, FlightStatus } from "@/lib/types";

type Status = BookingStatus | FlightStatus;

const styles: Record<Status, string> = {
  scheduled: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  boarding: "bg-sky-50 text-sky-700 ring-sky-200",
  delayed: "bg-amber-50 text-amber-700 ring-amber-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rescheduled: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${styles[status]}`}>
      {status}
    </span>
  );
}
