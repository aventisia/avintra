import { NoContentMessage } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { LogsIcon, TriangleAlert } from "lucide-react";
import { useEffect, useMemo } from "react";

import { useFetchExecutionLogsList } from "../../hooks/useFetchExecutionLogsList.hook";
import { useJobExecutionQueryParams } from "../../hooks/useJobExecutionQueryParams";
import { groupHistoryByDay } from "../../utils/groupHistoryByDay";
import AccordionSkeleton from "./AccordionSkeleton";
import ExecutionLogAccordion from "./ExecutionLogAccordion";

export default function ExecutionLogContent() {
  const { jobId, setJobId } = useJobExecutionQueryParams();

  const { data: logList, isFetching, isError, refetch } = useFetchExecutionLogsList();

  const groupedLogs = useMemo(() => groupHistoryByDay(logList?.data), [logList?.data]);

  // IMPORTANT NOTE: Auto-select waits for fetching to finish so it never picks a stale entry.
  useEffect(() => {
    if (isFetching) return;
    if (!groupedLogs.length) return;

    if (jobId) return;

    const firstId = groupedLogs[0].entries[0]?.id;
    if (firstId) {
      setJobId(firstId);
    }
  }, [groupedLogs, jobId, isFetching, setJobId]);

  if (isFetching) return <AccordionSkeleton />;

  if (isError && !groupedLogs.length) {
    return (
      <NoContentMessage
        className="absolute inset-0"
        Icon={TriangleAlert}
        primaryMessage="Could not load executions"
        secondaryMessage="Something went wrong while fetching the execution logs."
        action={
          <Button className="mt-4" size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!groupedLogs.length) {
    return (
      <NoContentMessage
        className="absolute inset-0"
        Icon={LogsIcon}
        primaryMessage="No executions found for this flow version"
        secondaryMessage="Run this version to create its first execution log."
      />
    );
  }

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
      <ExecutionLogAccordion data={groupedLogs} selectedEntry={jobId ?? ""} onSelect={setJobId} />
    </div>
  );
}
