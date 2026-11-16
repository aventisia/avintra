const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** A message's time for the thread: "2:14 PM" today, "Nov 9, 2:14 PM" this year, else with the year. */
export const formatMessageTime = (date: Date, now = new Date()) =>
  date.toLocaleString(undefined, {
    ...(sameDay(date, now)
      ? {}
      : {
          month: "short",
          day: "numeric",
          ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
        }),
    hour: "numeric",
    minute: "2-digit",
  });
