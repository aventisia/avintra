import { FlowVersionHistoryDto } from "../dtos/agent-history-dto";
import { DaySection } from "../types/agent-history-type";

export const groupHistoryByDay = (data: FlowVersionHistoryDto[] | undefined): DaySection[] => {
  if (!data?.length) return [];

  const effectiveDate = (item: FlowVersionHistoryDto) => item.lastModifiedOn ?? item.createdOn;

  const sorted = [...data].sort(
    (a, b) => new Date(effectiveDate(b)).getTime() - new Date(effectiveDate(a)).getTime(),
  );

  const map = new Map<string, DaySection>();

  sorted.forEach((item) => {
    const dateObj = new Date(effectiveDate(item));

    const fullDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!map.has(fullDate)) {
      map.set(fullDate, {
        date: fullDate,
        startedAt: dateObj.getTime(),
        entries: [],
      });
    }

    map.get(fullDate)!.entries.push({
      id: item.id,
      time,
      user: {
        name: item.lastModifiedBy ?? item.createdBy ?? "Unknown",
        initials: item.lastModifiedByUserInitials ?? item.createdByUserInitials ?? "NA",
      },
    });
  });

  return Array.from(map.values());
};
