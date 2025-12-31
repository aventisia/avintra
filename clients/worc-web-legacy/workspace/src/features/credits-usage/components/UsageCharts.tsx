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
    label: "Executions",
  },
} satisfies ChartConfig;

const UsageCharts = () => {
  const { data } = useFetchCreditUsageSummary();
  const creditChartData = data?.data.creditUsages || [];
  const agentCreditChartData = data?.data.agentCreditUsages || [];
  const agentTransactionChartData = data?.data.agentTransactionUsages || [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartLineInteractive
        title="Total Credits Used"
        total={data?.data.usageSummary.totalCredits || 0}
        data={creditChartData}
        chartConfig={totalCreditsChartConfig}
        valueKey="totalCount"
        className="col-span-2"
      />
      <ChartLineInteractive
        title="Total Agent Credits"
        total={data?.data.usageSummary.totalAgentCredits || 0}
        data={agentCreditChartData}
        chartConfig={totalCreditsChartConfig}
        valueKey="totalCount"
        className="col-span-1"
      />
      <ChartLineInteractive
        title="Total Agent Executions"
        total={data?.data.usageSummary.totalAgentTransactions || 0}
        data={agentTransactionChartData}
        chartConfig={totalTransactionsChartConfig}
        valueKey="totalCount"
        className="col-span-1"
      />
    </div>
  );
};

export default UsageCharts;
