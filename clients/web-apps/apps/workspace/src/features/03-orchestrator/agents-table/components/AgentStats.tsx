import { StatsCard } from "@avplatform/ui/cards";
import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import Enumerable from "linq";
import { Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { BsRobot } from "react-icons/bs";

import NewAgentIcon from "@/components/NewAgentIcon";

import type { AgentsTableDto } from "../dtos/agents-table-dto";

type StatsProps = {
  data: AgentsTableDto[];
};

type StatusDetails = {
  totalMachineCount: number;
  active: number;
  inactive: number;
  agents: number;
};

export const AgentStats = ({ data }: StatsProps) => {
  const [stats, setStats] = useState<StatusDetails>();

  useEffect(() => {
    const totalData = Enumerable.from(data);
    setStats({
      totalMachineCount: totalData.sum((x) => x.machineCount ?? 0),
      agents: totalData.count(
        (x) =>
          x.type === FlowTypesEnum.Agent ||
          x.type === FlowTypesEnum.ChatAgent ||
          x.type === FlowTypesEnum.VoiceAgent,
      ),
      active: totalData.count((x) => x.isActive),
      inactive: totalData.count((x) => !x.isActive),
    });
  }, [data]);

  return (
    <div className="mb-2 grid grid-cols-3 gap-4">
      <StatsCard
        key="Total Published Agents"
        icon={<NewAgentIcon className="size-7" />}
        title={"Total published agents"}
        content={data?.length}
      />
      <StatsCard
        key={"Total Machines"}
        icon={<Monitor className="size-7" />}
        title={"Total machines"}
        content={stats?.totalMachineCount ?? 0}
      />
      <StatsCard
        key={"Total Active Machines"}
        icon={<BsRobot className="size-7" />}
        title={"Total active machines"}
        content={stats?.active ?? 0}
      />
    </div>
  );
};
