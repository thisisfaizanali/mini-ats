// Explicit timeZone: Vercel servers run in UTC.
const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

export const formatDate = (d: Date) => dateFormat.format(d);
