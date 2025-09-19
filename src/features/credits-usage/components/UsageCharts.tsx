import { useFetchCreditUsageSummary } from "../hooks/useFetchCreditUsageSummary";
import { ChartConfig } from "../shared/charts/Chart";
import { ChartLineInteractive } from "../shared/charts/LineChart";

const totalCreditsChartConfig = {
  views: {
    label: "Credits",
  },
} satisfies ChartConfig;

const totalTransactionsChartConfig = {
  views: {
    label: "Transactions",
  },
} satisfies ChartConfig;

const UsageCharts = () => {
  const { data } = useFetchCreditUsageSummary();
  const totalCreditChartData = data?.data.creditUsages || [];
  const totalTransactionsChartData = data?.data.transactionUsages || [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartLineInteractive
        title="Total Credits Used"
        data={totalCreditChartData}
        chartConfig={totalCreditsChartConfig}
        valueKey="totalCredits"
      />
      <ChartLineInteractive
        title="Total Transactions"
        data={totalTransactionsChartData}
        chartConfig={totalTransactionsChartConfig}
        valueKey="totalTransactions"
      />
    </div>
  );
};

export default UsageCharts;
