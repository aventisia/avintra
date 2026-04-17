import { format } from "date-fns";

const formatDuration = (sec: number) => {
  const min = Math.floor(sec / 60);
  const secRemain = Math.round(sec % 60);
  return min > 0 ? `${min}m ${secRemain}s` : `${secRemain}s`;
};

const formatSecondsToCompactDuration = (totalSeconds?: number) => {
  if (!totalSeconds || totalSeconds <= 0) return "0s";

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  const parts: string[] = [];

  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);

  // If duration is less than 1 second, show "<1s"
  if (parts.length === 0) return "<1s";

  return parts.join(" ");
};

// Format date
const getFormattedDate = (date: Date) => format(date, "dd-MMM-yyyy hh:mm a");

export { formatDuration, getFormattedDate, formatSecondsToCompactDuration };
