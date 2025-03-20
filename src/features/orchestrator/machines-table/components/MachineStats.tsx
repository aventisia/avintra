import { MonitorCheck } from 'lucide-react';
import { MdOutlineDisplaySettings } from 'react-icons/md';
import { TbHeartRateMonitor } from 'react-icons/tb';

import { StatsCard } from '@/react-toolkit/ui/card/StatsCard';

export const MachineStats = () => {
  return (
    <div className="my-4 grid grid-cols-3 gap-10 gap-x-8">
      <StatsCard
        title={"Machines"}
        description={"25 consumed & 5 available"}
        mainText={"30"}
        icon={<MonitorCheck className="h-10 w-10" />}
      />
      <StatsCard
        title={"Environments"}
        description={
          <>
            <span className="text-green-600"> 120 Online</span>,{" "}
            <span className="text-primary-600"> 50 running</span>,{" "}
            <span className="text-slate-600"> 80 Offline</span>
          </>
        }
        mainText={"30"}
        icon={<MdOutlineDisplaySettings className="h-10 w-10" />}
      />
      <StatsCard
        title={"Status"}
        description={"25 consumed & 5 available"}
        mainText={"30"}
        icon={<TbHeartRateMonitor className="h-10 w-10" />}
      />
    </div>
  );
};
