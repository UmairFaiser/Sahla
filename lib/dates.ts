const stamp = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const day = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatStamp(iso: string) {
  return `${stamp.format(new Date(iso))} UTC`;
}

export function formatDay(iso: string) {
  return day.format(new Date(iso));
}
