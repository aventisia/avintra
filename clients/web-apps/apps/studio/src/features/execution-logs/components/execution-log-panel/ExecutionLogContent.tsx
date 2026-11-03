import { EmptyState } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { ListDashesIcon, WarningIcon } from "@phosphor-icons/react";
import { useEffect, useMemo } from "react";

import { useFetchExecutionLogsList } from "../../hooks/useFetchExecutionLogsList.hook";
import { useJobExecutionQueryParams } from "../../hooks/useJobExecutionQueryParams";
import { groupHistoryByDay } from "../../utils/groupHistoryByDay";
import { isErrorStatus } from "../../utils/job-log-level";
import AccordionSkeleton from "./AccordionSkeleton";
import ExecutionLogAccordion from "./ExecutionLogAccordion";

interface Props {
  errorsOnly: boolean;
}

export default function ExecutionLogContent({ errorsOnly }: Props) {
  const { jobId, setJobId } = useJobExecutionQueryParams();

  const { data: logList, isFetching, isError, refetch } = useFetchExecutionLogsList();

  const groupedLogs = useMemo(() => groupHistoryByDay(logList?.data), [logList?.data]);

  const visibleLogs = useMemo(
    () =>
      errorsOnly
        ? groupHistoryByDay(logList?.data?.filter((log) => isErrorStatus(log.status)))
        : groupedLogs,
    [errorsOnly, groupedLogs, logList?.data],
  );

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
      <EmptyState
        className="absolute inset-0"
        Icon={WarningIcon}
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
      <EmptyState
        className="absolute inset-0"
        Icon={ListDashesIcon}
        primaryMessage="No executions found for this flow version"
        secondaryMessage="Run this version to create its first execution log."
      />
    );
  }

  return (
    <div className="py-1.5">
      {visibleLogs.length > 0 ? (
        <ExecutionLogAccordion
          data={visibleLogs}
          selectedEntry={jobId ?? ""}
          onSelect={(id) => setJobId(id)}
        />
      ) : (
        <p className="px-4 py-6 text-center text-body-sm text-muted-foreground">No failed runs.</p>
      )}
    </div>
  );
}
