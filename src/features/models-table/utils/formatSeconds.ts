import { intervalToDuration } from "date-fns";

export const formatSeconds = (totalSeconds: number): string => {
  const duration = intervalToDuration({
    start: 0,
    end: totalSeconds * 1000,
  });

  const parts = [];

  if (duration.hours) parts.push(`${duration.hours}hr`);
  if (duration.minutes) parts.push(`${duration.minutes}m`);
  if (duration.seconds) parts.push(`${duration.seconds}s`);

  return parts.join(" ");
};
