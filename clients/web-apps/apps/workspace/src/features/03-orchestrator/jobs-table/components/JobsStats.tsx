import { StatsCard } from "@avplatform/ui/cards";
import { Clock10Icon, MonitorPlayIcon } from "lucide-react";
import { useMemo } from "react";

import NewAgentIcon from "@/components/NewAgentIcon";

import { JobStatusEnum, JobsTableRowDto, formatSecondsToCompactDuration } from "..";

interface StatsProps {
  data: JobsTableRowDto[];
}

export const JobsStats = ({ data }: StatsProps) => {
  const stats = useMemo(() => {
    if (!data?.length) {
      return {
        jobs: 0,
        agents: 0,
        totalExecutionLabel: "0 sec",
        completed: 0,
        failed: 0,
        aborted: 0,
        killed: 0,
        avgLabel: "0 sec",
      };
    }

    const jobs = data.length;

    const uniqueAgents = new Set(data.map((x) => x.flowName).filter(Boolean));

    const completed = data.filter((x) => x.status === JobStatusEnum.Completed).length;

    const failed = data.filter((x) => x.status === JobStatusEnum.Failed).length;

    const aborted = data.filter((x) => x.status === JobStatusEnum.Aborted).length;

    const killed = data.filter((x) => x.status === JobStatusEnum.Killed).length;

    const totalSeconds = data.reduce((acc, x) => {
      if (x.startTimeStamp && x.endTimeStamp) {
        const duration =
          (new Date(x.endTimeStamp).getTime() - new Date(x.startTimeStamp).getTime()) / 1000;
        return acc + duration;
      }
      return acc;
    }, 0);

    const avgSeconds = Math.round(totalSeconds / jobs);

    return {
      jobs,
      agents: uniqueAgents.size,
      completed,
      failed,
      aborted,
      killed,
      totalExecutionLabel: formatSecondsToCompactDuration(totalSeconds),
      avgLabel: formatSecondsToCompactDuration(avgSeconds),
    };
  }, [data]);

  return (
    <div className="mb-2 grid grid-cols-3 gap-4">
      {/* Total Jobs */}
      <StatsCard
        icon={<MonitorPlayIcon className="size-7" />}
        title="Total jobs"
        content={stats.jobs}
        footer={
          <>
            <span className="font-mono text-xs font-medium tabular-nums">{stats.completed}</span>{" "}
            Completed,{" "}
            <span className="font-mono text-xs font-medium tabular-nums">{stats.failed}</span>{" "}
            Failed,{" "}
            <span className="font-mono text-xs font-medium tabular-nums">{stats.aborted}</span>{" "}
            Aborted,{" "}
            <span className="font-mono text-xs font-medium tabular-nums">{stats.killed}</span>{" "}
            Killed
          </>
        }
      />

      {/* Active Agents */}
      <StatsCard
        icon={<NewAgentIcon className="size-7 " />}
        title="Total agents"
        content={stats.agents}
        footer="Distinct agents that have executed jobs"
      />

      {/* Execution Time */}
      <StatsCard
        icon={<Clock10Icon className="size-7" />}
        title="Execution time"
        content={stats.totalExecutionLabel}
        footer={
          <>
            Avg.{" "}
            <span className="font-mono text-xs font-medium tabular-nums">{stats.avgLabel}</span> per
            job
          </>
        }
      />
    </div>
  );
};
