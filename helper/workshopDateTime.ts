export const WORKSHOP_TIME_ZONE = "Asia/Kolkata";

type WorkshopDateValue = Date | string | null | undefined;

function workshopDate(value: WorkshopDateValue) {
  if (!value) return null;
  // Drizzle reads the existing timestamp-without-time-zone columns as UTC.
  // Apply that same convention to raw database strings without an offset.
  const normalized =
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value)
      ? `${value.replace(" ", "T")}Z`
      : value;
  const date = normalized instanceof Date ? normalized : new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatWorkshopDate(value: WorkshopDateValue) {
  const date = workshopDate(value);
  return date
    ? new Intl.DateTimeFormat("en-IN", {
        timeZone: WORKSHOP_TIME_ZONE,
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date)
    : "N/A";
}

export function formatWorkshopTime(value: WorkshopDateValue) {
  const date = workshopDate(value);
  return date
    ? new Intl.DateTimeFormat("en-IN", {
        timeZone: WORKSHOP_TIME_ZONE,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date)
    : "N/A";
}

export function formatWorkshopDateTime(value: WorkshopDateValue) {
  return workshopDate(value)
    ? `${formatWorkshopDate(value)}, ${formatWorkshopTime(value)} IST`
    : "N/A";
}

export function formatWorkshopInput(value: WorkshopDateValue) {
  const date = workshopDate(value);
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WORKSHOP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function parseWorkshopInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    throw new Error("Enter a valid workshop date and time (IST).");
  }
  // The admin field always represents IST, regardless of the device timezone.
  const date = new Date(`${value}:00+05:30`);
  if (Number.isNaN(date.getTime()) || formatWorkshopInput(date) !== value) {
    throw new Error("Enter a valid workshop date and time (IST).");
  }
  return date;
}
