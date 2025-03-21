import Enumerable from "linq";
import { MonitorCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { MdOutlineDisplaySettings } from "react-icons/md";
import { TbHeartRateMonitor } from "react-icons/tb";

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
  windows: number;
  dev: number;
  uat: number;
  prod: number;
};

export const MachineStats = ({ data }: MachineStatsProps) => {
  const [stats, setStats] = useState<MachineStatusDetails>();

  useEffect(() => {
    const statuses = Enumerable.from(data);
    setStats({
      online: statuses.count((x) => x.status === MachineStatusTypesEnum.Online),
      idle: statuses.count((x) => x.status === MachineStatusTypesEnum.Idle),
      offline: statuses.count(
        (x) => x.status === MachineStatusTypesEnum.Offline,
      ),
      running: statuses.count(
        (x) => x.status === MachineStatusTypesEnum.Running,
      ),
      linux: statuses.count((x) => x.type === MachineOsTypesEnum.Linux),
      windows: statuses.count((x) => x.type === MachineOsTypesEnum.Windows),
      dev: statuses.count(
        (x) => x.environment === MachineEnvironmentTypesEnum.Development,
      ),
      uat: statuses.count(
        (x) => x.environment === MachineEnvironmentTypesEnum.UAT,
      ),
      prod: statuses.count(
        (x) => x.environment === MachineEnvironmentTypesEnum.Production,
      ),
    });
  }, [data]);

  return (
    <div className="my-4 grid grid-cols-3 gap-10 gap-x-8">
      <StatsCard
        title={"Machines"}
        description={`${stats?.linux} Linux & ${stats?.windows} Windows`}
        mainText={data?.length}
        icon={<MonitorCheck stroke="var(--primary)" className="h-10 w-10" />}
      />
      <StatsCard
        title={"Environments"}
        description={`${stats?.dev} Development, ${stats?.uat} UAT, ${stats?.prod} Production`}
        mainText={stats?.prod ?? 0}
        icon={
          <TbHeartRateMonitor stroke="var(--primary)" className="h-10 w-10" />
        }
      />
      <StatsCard
        title={"Statuses"}
        description={
          <>
            <span className="text-green-600"> {stats?.online} Online</span>,{" "}
            <span className="text-yellow-600"> {stats?.idle} idle</span>,{" "}
            <span className="text-slate-600"> {stats?.offline} Offline</span>
          </>
        }
        mainText={stats?.running ?? 0}
        icon={
          <MdOutlineDisplaySettings
            fill="var(--primary)"
            className="h-10 w-10"
          />
        }
      />
    </div>
  );
};
