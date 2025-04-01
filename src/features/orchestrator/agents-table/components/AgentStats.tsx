import Enumerable from 'linq';
import { BotIcon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BsRobot } from 'react-icons/bs';

import { StatsCard } from '@/react-toolkit/ui/card/StatsCard';

import type { AgentsTableDto } from "../dtos/agents-table-dto";
type StatsProps = {
  data: AgentsTableDto[];
};

type StatusDetails = {
  totalMachineCount: number;
  active: number;
  inactive: number;
};

export const AgentStats = ({ data }: StatsProps) => {
  const [stats, setStats] = useState<StatusDetails>();

  useEffect(() => {
    const totalData = Enumerable.from(data);
    setStats({
      totalMachineCount: totalData.sum((x) => x.machineCount ?? 0),
      active: totalData.count((x) => x.isActive),
      inactive: totalData.count((x) => !x.isActive),
    });
  }, [data]);

  return (
    <div className="my-4 grid grid-cols-3 gap-10 gap-x-8">
      <StatsCard
        title={"Agents"}
        mainText={data?.length}
        icon={<BotIcon stroke="var(--primary)" className="h-10 w-10" />}
      />
      <StatsCard
        title={"Machines"}
        mainText={stats?.totalMachineCount ?? 0}
        icon={<Monitor stroke="var(--primary)" className="h-10 w-10" />}
      />
      <StatsCard
        title={"Statuses"}
        description={
          <span className="text-slate-600"> {stats?.inactive} Inactive</span>
        }
        mainText={stats?.active ?? 0}
        icon={<BsRobot fill="var(--primary)" className="h-10 w-10" />}
      />
    </div>
  );
};
