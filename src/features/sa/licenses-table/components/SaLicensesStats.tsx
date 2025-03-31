import { FaMoneyBills } from "react-icons/fa6";
import { PiCertificate, PiScroll } from "react-icons/pi";

import { StatsCard } from "@/react-toolkit/ui/card/StatsCard";

export const SaLicensesStats = () => {
  return (
    <div className="my-4 grid grid-cols-3 gap-10 gap-x-8">
      <StatsCard
        title={"Total Tenants"}
        description={"5 dedicated  05 On-prem 15 shared"}
        mainText={"30"}
        icon={<PiCertificate fill="var(--primary)" className="h-10 w-10" />}
      />
      <StatsCard
        title={"License"}
        description={"25 consumed & 5 available"}
        mainText={"30"}
        icon={<PiScroll fill="var(--primary)" className="h-10 w-10" />}
      />
      <StatsCard
        title={"Credits"}
        description={"25 consumed & 5 available"}
        mainText={"30"}
        icon={<FaMoneyBills fill="var(--primary)" className="h-10 w-10" />}
      />
      <StatsCard
        title={"Annual Revenue"}
        description={"$5000 overdue"}
        mainText={"$25,000"}
        icon={<FaMoneyBills fill="var(--primary)" className="h-10 w-10" />}
      />
    </div>
  );
};
