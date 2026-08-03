import { useEffect, useMemo } from "react";

import { useFetchExecutionLogsList } from "../../hooks/useFetchExecutionLogsList";
import { useJobExecutionQueryParams } from "../../hooks/useJobExecutionQueryParams";
import { groupHistoryByDay } from "../../utils/groupHistoryByDay";
import AccordionSkeleton from "./AccordionSkeleton";
import ExecutionLogAccordion from "./ExecutionLogAccordion";

export default function ExecutionLogContent() {
  const { jobId, setJobId } = useJobExecutionQueryParams();

  /**
   *  Fetch list
   */
  const { data: logList, isFetching, isLoading } = useFetchExecutionLogsList();

  const groupedLogs = useMemo(() => groupHistoryByDay(logList?.data), [logList?.data]);

  /**
   *  If no jobId(j) in query param present, auto select first.
   *  Only runs after fetching completes to avoid selecting from stale data.
   */
  useEffect(() => {
    if (isFetching) return;
    if (!groupedLogs.length) return;

    if (jobId) return;

    const firstId = groupedLogs[0].entries[0]?.id;
    if (firstId) {
      setJobId(firstId);
    }
  }, [groupedLogs, jobId, isFetching]);

  if (isLoading || isFetching) return <AccordionSkeleton />;
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
      {groupedLogs.length > 0 && (
        <ExecutionLogAccordion
          data={groupedLogs}
          selectedEntry={jobId ?? ""}
          onSelect={(id) => setJobId(id)}
        />
      )}
    </div>
  );
}
