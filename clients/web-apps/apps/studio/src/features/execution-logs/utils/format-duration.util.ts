export const formatSecondsToCompactDuration = (totalSeconds?: number) => {
  if (!totalSeconds || totalSeconds <= 0) return "0s";

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  const parts: string[] = [];

  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);

  return parts.join(" ");
};

export const formatRunDuration = (startTime: string | null, endTime: string | null) => {
  if (!startTime || !endTime) return "—";

  const seconds = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;

  // IMPORTANT NOTE: the Jobs page shows "<1s" for a sub-second run; the header must match.
  return seconds < 1 ? "<1s" : formatSecondsToCompactDuration(seconds);
};
