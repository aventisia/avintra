import NewAgentIcon from "@/components/NewAgentIcon";
import { StatsCard } from "@/react-toolkit/ui/card/StatsCard";

import Enumerable from "linq";
import { Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { BsRobot } from "react-icons/bs";

import type { AgentsTableDto } from "../dtos/agents-table-dto";

type StatsProps = {
  data: AgentsTableDto[];
};

type StatusDetails = {
  totalMachineCount: number;
  active: number;
  inactive: number;
  agents: number;
  models: number;
};

export const AgentStats = ({ data }: StatsProps) => {
  const [stats, setStats] = useState<StatusDetails>();

  useEffect(() => {
    const totalData = Enumerable.from(data);
    setStats({
      totalMachineCount: totalData.sum((x) => x.machineCount ?? 0),
      agents: totalData.count((x) => x.type === "Agent"),
      models: totalData.count((x) => x.type === "AI Model"),
      active: totalData.count((x) => x.isActive),
      inactive: totalData.count((x) => !x.isActive),
    });
  }, [data]);

  return (
    <div className="my-4 grid grid-cols-3 gap-3">
      <StatsCard
        key="Total Published Agents"
        title={"Total Published Agents"}
        mainText={data?.length}
        icon={<NewAgentIcon className="h-10 w-10 text-primary" />}
        // description={`${stats?.agents} Agents & ${stats?.models} AI Models`}
      />
      <StatsCard
        title={"Total Hosts"}
        key={"Total Hosts"}
        mainText={stats?.totalMachineCount ?? 0}
        icon={<Monitor stroke="var(--primary)" className="h-10 w-10" />}
      />
      <StatsCard
        title={"Total Active Machines"}
        key={"Total Active Machines"}
        mainText={stats?.active ?? 0}
        icon={<BsRobot fill="var(--primary)" className="h-10 w-10" />}
      />
    </div>
  );
};
