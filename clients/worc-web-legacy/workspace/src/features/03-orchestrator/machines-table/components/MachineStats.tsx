import Enumerable from "linq";
import { Monitor, MonitorCheck, MonitorCog } from "lucide-react";
import { useEffect, useState } from "react";

import { MachineEnvironmentTypesEnum } from "@/react-toolkit/enums/machine-environment-types-enum";
import { MachineOsTypesEnum } from "@/react-toolkit/enums/machine-os-types-enum";
import { MachineStatusTypesEnum } from "@/react-toolkit/enums/machine-status-types-enum";
import { StatsCard } from "@/react-toolkit/ui/card/StatsCard";

import type { MachinesTableDto } from "../dtos/machines-table-dto";

type MachineStatsProps = {
  data: MachinesTableDto[];
};

type MachineStatusDetails = {
  online: number;
  offline: number;
  running: number;
  idle: number;
  linux: number;
  agents: number;
  dev: number;
  uat: number;
  prod: number;
  distinctStatuses: number;
  distinctEnvironments: number;
};

export const MachineStats = ({ data }: MachineStatsProps) => {
  const [stats, setStats] = useState<MachineStatusDetails | null>(null);

  useEffect(() => {
    const statuses = Enumerable.from(data);

    // Count machines in each status
    const statusCounts = {
      online: statuses.count((x) => x.status === MachineStatusTypesEnum.Online),
      offline: statuses.count(
        (x) => x.status === MachineStatusTypesEnum.Offline,
      ),
      running: statuses.count(
        (x) => x.status === MachineStatusTypesEnum.Running,
      ),
      idle: statuses.count((x) => x.status === MachineStatusTypesEnum.Idle),
    };

    // Count environments and distinct environments
    const environmentCounts = {
      dev: statuses.count(
        (x) => x.environment === MachineEnvironmentTypesEnum.Development,
      ),
      uat: statuses.count(
        (x) => x.environment === MachineEnvironmentTypesEnum.UAT,
      ),
      prod: statuses.count(
        (x) => x.environment === MachineEnvironmentTypesEnum.Production,
      ),
    };

    // Count distinct machine statuses
    const distinctStatuses = statuses
      .select((x) => x.status)
      .distinct()
      .count();

    // Count distinct environments (those with more than 0 machines)
    const distinctEnvironments = statuses
      .select((x) => x.environment)
      .distinct()
      .count();

    // Update the stats state
    setStats({
      online: statusCounts.online,
      offline: statusCounts.offline,
      running: statusCounts.running,
      idle: statusCounts.idle,
      linux: statuses.count(
        (x) => x.operatingSystem === MachineOsTypesEnum.Linux,
      ),
      agents: statuses.sum((x) => x.flowVersionCount ?? 0),
      dev: environmentCounts.dev,
      uat: environmentCounts.uat,
      prod: environmentCounts.prod,
      distinctStatuses,
      distinctEnvironments,
    });
  }, [data]);

  // Create environment description with count > 0
  const environmentDescription =
    [
      stats && stats.dev > 0 && `${stats.dev} Development`,
      stats && stats.uat > 0 && `${stats.uat} UAT`,
      stats && stats.prod > 0 && `${stats.prod} Production`,
    ]
      .filter(Boolean)
      .join(", ") || "No environments with machines";

  // Create status description with count > 0
  const statusDescription =
    [
      stats && stats.idle > 0 && `${stats.idle} idle`,
      stats && stats.online > 0 && `${stats.online} online`,
      stats && stats.offline > 0 && `${stats.offline} Offline`,
      stats && stats.running > 0 && `${stats.running} Running`,
    ]
      .filter(Boolean)
      .join(", ") || "No machines in these statuses";

  return (
    <div className="my-4 grid grid-cols-3 gap-3">
      <StatsCard
        title="Machines"
        description={`${stats?.agents} Flow Versions`}
        mainText={data?.length}
        icon={<Monitor stroke="var(--primary)" className="h-10 w-10" />}
      />
      <StatsCard
        title="Environments"
        description={environmentDescription}
        mainText={stats?.distinctEnvironments ?? 0} // Display distinct environments count
        icon={<MonitorCog stroke="var(--primary)" className="h-10 w-10" />}
      />
      <StatsCard
        title="Statuses"
        description={statusDescription}
        mainText={stats?.distinctStatuses ?? 0} // Display distinct statuses count
        icon={<MonitorCheck stroke="var(--primary)" className="h-10 w-10" />}
      />
    </div>
  );
};
