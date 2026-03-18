import NewAgentIcon from "@/components/NewAgentIcon";
import { StatsCard } from "@/react-toolkit/ui/card/StatsCard";

import { Clock10Icon, MonitorPlayIcon } from "lucide-react";
import { useMemo } from "react";

import { JobsTableDto } from "../dtos/jobs-table-dto";
import { JobStatusTypesEnum } from "../enums/job-status-type-enum";
import { formatSecondsToCompactDuration } from "../utils";

interface StatsProps {
  data: JobsTableDto[];
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
        avgLabel: "0 sec",
      };
    }

    const jobs = data.length;

    const uniqueAgents = new Set(data.map((x) => x.name).filter(Boolean));

    const completed = data.filter(
      (x) => x.status === JobStatusTypesEnum.Completed,
    ).length;

    const failed = data.filter(
      (x) => x.status === JobStatusTypesEnum.Failed,
    ).length;

    const aborted = data.filter(
      (x) => x.status === JobStatusTypesEnum.Abort,
    ).length;

    const totalSeconds = data.reduce((acc, x) => acc + (x.duration ?? 0), 0);

    const avgSeconds = Math.round(totalSeconds / jobs);

    return {
      jobs,
      agents: uniqueAgents.size,
      completed,
      failed,
      aborted,
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
        description={`${stats.completed} Completed, ${stats.failed} Failed, ${stats.aborted} Aborted`}
        icon={<MonitorPlayIcon stroke="var(--primary)" className="h-10 w-10" />}
      />

      {/* Active Agents */}
      <StatsCard
        title="Total Agents"
        mainText={stats.agents}
        description="Unique agents executed jobs"
        icon={
          <NewAgentIcon className="h-10 w-10 text-primary stroke-primary " />
        }
      />

      {/* Execution Time */}
      <StatsCard
        title="Execution Time"
        mainText={stats.totalExecutionLabel}
        description={`Avg ${stats.avgLabel} per job`}
        icon={<Clock10Icon stroke="var(--primary)" className="h-10 w-10" />}
      />
    </div>
  );
};
