import { useEffect, useMemo } from "react";

import { DayTimelineSkeleton } from "@/components/day-timeline";

import { useFetchVersionHistoryList } from "../../hooks/useFetchVersionHistoryList";
import { useVersionHistoryQueryParams } from "../../hooks/useVersionHistoryQueryParams";
import { groupHistoryByDay } from "../../utils/groupHistoryByDay";
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

  if (isLoading) return <DayTimelineSkeleton label="Loading change history" />;
  return (
    <div className="pb-2">
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
