import IEnumerable from "linq";
import { GiWallet } from "react-icons/gi";
import { PiCertificate } from "react-icons/pi";
import { TbDatabaseDollar } from "react-icons/tb";

import { StatsCard } from "@/react-toolkit/ui/card/StatsCard";
import { currencyFormater } from "@/react-toolkit/utils/currency-formatter";
import { useQueryClient } from "@tanstack/react-query";

import { DATA_QUERY_KEY } from "../constants";
import { InovicesTableDto } from "../dtos/inovices-table-dto";

type InvoicesStatsDetails = {
  last12MonthExpense: number;
  overdueBalance: number;
  nextPayableAmount?: number;
};

export const InvoicesStats = () => {
  const queryClient = useQueryClient();

  const licensesData = queryClient.getQueryData<{
    data: InovicesTableDto[];
  }>(DATA_QUERY_KEY);

  const statsData = IEnumerable.from<InovicesTableDto>(
    licensesData?.data ?? [],
  );

  const stats: InvoicesStatsDetails = {
    last12MonthExpense: statsData
      .orderByDescending((x) => x.dueDate)
      .take(12)
      .sum((x) => x.totalAmount),
    overdueBalance: statsData.sum((x) => x.discount),
    nextPayableAmount: statsData
      .orderByDescending((x) => x.dueDate)
      .take(1)
      .firstOrDefault()?.totalAmount,
  };

  return (
    <div className="my-4 grid grid-cols-3 gap-10 gap-x-8">
      <StatsCard
        title={"Last 12 Month Expense"}
        mainText={stats.last12MonthExpense}
        icon={<PiCertificate fill="var(--primary)" className="h-10 w-10" />}
      />
      <StatsCard
        title={"Total Overdue"}
        mainText={stats.overdueBalance}
        icon={
          <TbDatabaseDollar stroke="var(--primary)" className="h-10 w-10" />
        }
      />

      <StatsCard
        title={"Annual Billing"}
        mainText={currencyFormater(stats.nextPayableAmount ?? 0, "USD")}
        icon={<GiWallet fill="var(--primary)" className="h-10 w-10" />}
      />
    </div>
  );
};
