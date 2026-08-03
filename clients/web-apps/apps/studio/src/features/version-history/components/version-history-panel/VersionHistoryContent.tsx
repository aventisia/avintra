import { useEffect, useMemo } from "react";

import { useFetchVersionHistoryList } from "../../hooks/useFetchVersionHistoryList";
import { useVersionHistoryQueryParams } from "../../hooks/useVersionHistoryQueryParams";
import { groupHistoryByDay } from "../../utils/groupHistoryByDay";
import VersionAccordionSkeleton from "./VersionAccordionSkeleton";
import VersionHistoryAccordion from "./VersionHistoryAccordion";

export default function VersionHistoryContent() {
  const { historyId, setHistoryId } = useVersionHistoryQueryParams();

  /**
   *  Fetch list
   */
  const { data: historyList, isLoading } = useFetchVersionHistoryList();

  const groupedHistory = useMemo(() => groupHistoryByDay(historyList?.data), [historyList?.data]);

  /**
   *  If no historyId(h) in query param present, auto select first
   */
  useEffect(() => {
    if (!groupedHistory.length) return;
    if (historyId) return;

    const firstId = groupedHistory[0].entries[0]?.id;
    if (firstId) {
      setHistoryId(firstId);
    }
  }, [groupedHistory, historyId]);

  if (isLoading) return <VersionAccordionSkeleton />;
  return (
    <div className="relative p-2 pr-2.5">
      {/* Continuous Timeline - spans entire height from first to last accordion */}
      <div
        className="pointer-events-none absolute left-[23px] w-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800"
        style={{
          top: "48px", // Starts after first accordion trigger (py-2 + h-8 + py-2 + pt-2)
          bottom: "16px", // Ends before last accordion trigger
        }}
      />
      {groupedHistory.length > 0 && (
        <VersionHistoryAccordion
          data={groupedHistory}
          selectedEntry={historyId ?? ""}
          onSelect={(id) => setHistoryId(id)}
        />
      )}
    </div>
  );
}
