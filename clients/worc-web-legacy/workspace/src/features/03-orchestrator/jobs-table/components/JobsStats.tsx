import { Clock10Icon, MonitorPlayIcon } from "lucide-react";
import { useMemo } from "react";

import NewAgentIcon from "@/components/NewAgentIcon";
import { StatsCard } from "@/react-toolkit/ui/card/StatsCard";

import {
  JobStatusEnum,
  JobsTableRowDto,
  formatSecondsToCompactDuration,
} from "..";

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

    const completed = data.filter(
      (x) => x.status === JobStatusEnum.Completed,
    ).length;

    const failed = data.filter((x) => x.status === JobStatusEnum.Failed).length;

    const aborted = data.filter(
      (x) => x.status === JobStatusEnum.Aborted,
    ).length;

    const killed = data.filter((x) => x.status === JobStatusEnum.Killed).length;

    const totalSeconds = data.reduce((acc, x) => {
      if (x.startTimeStamp && x.endTimeStamp) {
        const duration =
          (new Date(x.endTimeStamp).getTime() -
            new Date(x.startTimeStamp).getTime()) /
          1000;
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
    <div className="my-4 grid grid-cols-3 gap-3">
      {/* Total Jobs */}
      <StatsCard
        title="Total Jobs"
        mainText={stats.jobs}
        description={
          <>
            <span className="font-medium text-xs">{stats.completed}</span>{" "}
            Completed,{" "}
            <span className="font-medium text-xs">{stats.failed}</span> Failed,{" "}
            <span className="font-medium text-xs">{stats.aborted}</span>{" "}
            Aborted, <span className="font-medium text-xs">{stats.killed}</span>{" "}
            Killed
          </>
        }
        icon={<MonitorPlayIcon className="size-8 stroke-primary" />}
      />

      {/* Active Agents */}
      <StatsCard
        title="Total Agents"
        mainText={stats.agents}
        description="Distinct agents that have executed jobs"
        icon={<NewAgentIcon className="size-8 text-primary stroke-primary " />}
      />

      {/* Execution Time */}
      <StatsCard
        title="Execution Time"
        mainText={stats.totalExecutionLabel}
        description={
          <>
            Avg. <span className="font-medium text-xs">{stats.avgLabel}</span>{" "}
            per job
          </>
        }
        // description={`Avg ${stats.avgLabel} per job`}
        icon={<Clock10Icon className="size-8 stroke-primary" />}
      />
    </div>
  );
};
