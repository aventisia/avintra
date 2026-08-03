import { FlowVersionHistoryDto } from "../dtos/agent-history-dto";
import { DaySection } from "../types/agent-history-type";

export const groupHistoryByDay = (data: FlowVersionHistoryDto[] | undefined): DaySection[] => {
  if (!data?.length) return [];

  const sorted = [...data].sort(
    (a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime(),
  );

  const map = new Map<string, DaySection>();

  sorted.forEach((item) => {
    const dateObj = new Date(item.createdOn);

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
      user: {
        name: item.createdBy ?? "Unknown",
        initials: item.createdByUserInitials ?? "NA",
      },
    });
  });

  return Array.from(map.values());
};
