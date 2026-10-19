// Explicit timeZone: Vercel servers run in UTC.
const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

export const formatDate = (d: Date) => dateFormat.format(d);

const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export const formatDateTime = (d: Date) => dateTimeFormat.format(d);

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60],
  ["month", 30 * 24 * 60],
  ["day", 24 * 60],
  ["hour", 60],
  ["minute", 1],
];

export function formatRelative(d: Date) {
  const minutes = (d.getTime() - Date.now()) / 60_000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(minutes) >= size) return relativeFormat.format(Math.round(minutes / size), unit);
  }
  return relativeFormat.format(0, "second"); // "now"
}
