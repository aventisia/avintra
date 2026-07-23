import { StatsCard } from "@avplatform/ui/cards";
import { EnvironmentTypesEnum } from "@avplatform/ui/enums/environment-types-enum";
import { MachineStatusEnum } from "@avplatform/ui/enums/machine-status-enum";
import { OsTypesEnum } from "@avplatform/ui/enums/os-types-enum";
import Enumerable from "linq";
import { Monitor, MonitorCheck, MonitorCog } from "lucide-react";
import { useEffect, useState } from "react";

import type { MachinesTableRowDto } from "../dtos/machines-table-row-dto";

type MachineStatsProps = {
  data: MachinesTableRowDto[];
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
      online: statuses.count((x) => x.status === MachineStatusEnum.Online),
      offline: statuses.count((x) => x.status === MachineStatusEnum.Offline),
      running: statuses.count((x) => x.status === MachineStatusEnum.Running),
      idle: statuses.count((x) => x.status === MachineStatusEnum.Idle),
    };

    // Count environments and distinct environments
    const environmentCounts = {
      dev: statuses.count((x) => x.environment === EnvironmentTypesEnum.Development),
      uat: statuses.count((x) => x.environment === EnvironmentTypesEnum.UAT),
      prod: statuses.count((x) => x.environment === EnvironmentTypesEnum.Production),
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
      linux: statuses.count((x) => x.operatingSystem === OsTypesEnum.Linux),
      agents: statuses.sum((x) => x.flowVersionCount ?? 0),
      dev: environmentCounts.dev,
      uat: environmentCounts.uat,
      prod: environmentCounts.prod,
      distinctStatuses,
      distinctEnvironments,
    });
  }, [data]);

  // Create environment description with count > 0
  const environmentParts = [
    stats && stats.dev > 0 && (
      <>
        <span className="font-medium text-xs">{stats.dev}</span> Development
      </>
    ),
    stats && stats.uat > 0 && (
      <>
        <span className="font-medium text-xs">{stats.uat}</span> UAT
      </>
    ),
    stats && stats.prod > 0 && (
      <>
        <span className="font-medium text-xs">{stats.prod}</span> Production
      </>
    ),
  ].filter(Boolean) as JSX.Element[];

  const environmentDescription: JSX.Element | string =
    environmentParts.length > 0 ? (
      <>
        {environmentParts.map((part, i) => (
          <span key={i}>
            {i > 0 && ", "}
            {part}
          </span>
        ))}
      </>
    ) : (
      "No environments with machines"
    );

  // Create status description with count > 0
  const statusParts = [
    stats && stats.idle > 0 && (
      <>
        <span className="font-medium text-xs">{stats.idle}</span> idle
      </>
    ),
    stats && stats.online > 0 && (
      <>
        <span className="font-medium text-xs">{stats.online}</span> online
      </>
    ),
    stats && stats.offline > 0 && (
      <>
        <span className="font-medium text-xs">{stats.offline}</span> Offline
      </>
    ),
    stats && stats.running > 0 && (
      <>
        <span className="font-medium text-xs">{stats.running}</span> Running
      </>
    ),
  ].filter(Boolean) as JSX.Element[];

  const statusDescription: JSX.Element | string =
    statusParts.length > 0 ? (
      <>
        {statusParts.map((part, i) => (
          <span key={i}>
            {i > 0 && ", "}
            {part}
          </span>
        ))}
      </>
    ) : (
      "No machines in these statuses"
    );

  return (
    <div className="mb-2 grid grid-cols-3 gap-4">
      <StatsCard
        icon={<Monitor className="size-7" />}
        title="Machines"
        content={data?.length}
        footer={
          <>
            <span className="font-medium text-xs">{stats?.agents}</span> Agents
          </>
        }
      />
      <StatsCard
        icon={<MonitorCog className="size-7" />}
        title="Environments"
        content={stats?.distinctEnvironments ?? 0} // Display distinct environments count
        footer={environmentDescription}
      />
      <StatsCard
        icon={<MonitorCheck className="size-7" />}
        title="Statuses"
        content={stats?.distinctStatuses ?? 0} // Display distinct statuses count
        footer={statusDescription}
      />
    </div>
  );
};
