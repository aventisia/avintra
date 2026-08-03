import { JobExecutionLogDto } from "../dtos/job-execution-log-dto";
import { DaySection } from "../types/log-list-type";

export const groupHistoryByDay = (data: JobExecutionLogDto[] | undefined): DaySection[] => {
  if (!data?.length) return [];

  const sorted = [...data].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  );

  const map = new Map<string, DaySection>();

  sorted.forEach((item) => {
    const dateObj = new Date(item.startTime);

    const fullDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const shortDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });

    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!map.has(fullDate)) {
      map.set(fullDate, {
        date: fullDate,
        dateFormatted: shortDate,
        entries: [],
      });
    }

    map.get(fullDate)!.entries.push({
      id: item.id,
      time,
      duration: item.duration,
      status: item.status,
      user: {
        name: "Unknown",
        initials: "NA",
      },
    });
  });

  return Array.from(map.values());
};
