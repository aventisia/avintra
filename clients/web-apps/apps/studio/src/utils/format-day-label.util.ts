const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (time: number) => {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/** "Today", "Yesterday", "Fri, Nov 13", or "Fri, Nov 13, 2025" outside the current year. */
export const formatDayLabel = (time: number, now = Date.now()) => {
  const daysAgo = Math.round((startOfDay(now) - startOfDay(time)) / DAY_MS);
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";

  const isSameYear = new Date(time).getFullYear() === new Date(now).getFullYear();
  return new Date(time).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: isSameYear ? undefined : "numeric",
  });
};
