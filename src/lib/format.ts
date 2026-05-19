import { format, intervalToDuration } from "date-fns";

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(value: string) {
  return format(new Date(value), "dd MMM yyyy, h:mm a");
}

export function formatTime(value: string) {
  return format(new Date(value), "h:mm a");
}

export function formatDuration(start: string, end: string) {
  const duration = intervalToDuration({
    start: new Date(start),
    end: new Date(end),
  });

  return `${duration.hours ?? 0}h ${duration.minutes ?? 0}m`;
}
