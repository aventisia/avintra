import { Button } from "@avplatform/ui/buttons";
import { ListDashesIcon, WarningIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
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
      <RunLogEmptyState
        Icon={WarningIcon}
        title="Could not load runs"
        description="Something went wrong while fetching the execution logs."
        action={
          <Button className="mt-3" size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!groupedLogs.length) {
    return (
      <RunLogEmptyState
        Icon={ListDashesIcon}
        title="No runs for this version"
        description="Run this version to create its first execution log."
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

interface RunLogEmptyStateProps {
  Icon: Icon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

/** Dashed placeholder box, matching the empty state in the agent details panel. */
const RunLogEmptyState = ({ Icon, title, description, action }: RunLogEmptyStateProps) => (
  <div className="mx-4 my-4 flex h-36 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-strong/50 px-4 text-center">
    <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
    <p className="text-body-sm font-medium text-ink-2">{title}</p>
    <p className="text-hint text-muted-foreground">{description}</p>
    {action}
  </div>
);
