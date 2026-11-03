import { StatsCard } from "@avplatform/ui/cards";
import { MachineStatusEnum } from "@avplatform/ui/enums/machine-status-enum";
import { OsTypesEnum } from "@avplatform/ui/enums/os-types-enum";
import { MonitorIcon } from "@phosphor-icons/react";
import Enumerable from "linq";
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
  distinctStatuses: number;
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

    // Count distinct machine statuses
    const distinctStatuses = statuses
      .select((x) => x.status)
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
      distinctStatuses,
    });
  }, [data]);

  // Create status description with count > 0
  const statusParts = [
    stats && stats.idle > 0 && (
      <>
        <span className="font-mono text-xs font-medium tabular-nums">{stats.idle}</span> idle
      </>
    ),
    stats && stats.online > 0 && (
      <>
        <span className="font-mono text-xs font-medium tabular-nums">{stats.online}</span> online
      </>
    ),
    stats && stats.offline > 0 && (
      <>
        <span className="font-mono text-xs font-medium tabular-nums">{stats.offline}</span> Offline
      </>
    ),
    stats && stats.running > 0 && (
      <>
        <span className="font-mono text-xs font-medium tabular-nums">{stats.running}</span> Running
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
    <div className="mb-2 grid grid-cols-2 gap-4">
      <StatsCard
        icon={<MonitorIcon className="size-7" />}
        title="Machines"
        content={data?.length}
        footer={
          <>
            <span className="font-mono text-xs font-medium tabular-nums">{stats?.agents}</span>{" "}
            Agents
          </>
        }
      />
      <StatsCard
        icon={<MonitorIcon className="size-7" />}
        title="Statuses"
        content={stats?.distinctStatuses ?? 0} // Display distinct statuses count
        footer={statusDescription}
      />
    </div>
  );
};
