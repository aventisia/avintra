import { useFetchCreditUsageSummary } from "../hooks/useFetchCreditUsageSummary.ee";
import { ChartConfig } from "../shared/charts/Chart.ee";
import { ChartLineInteractive } from "../shared/charts/LineChart.ee";
import { useDateRangePickerStore } from "../store/date-range-store.ee";

const totalCreditsChartConfig = {
  views: {
    label: "Credits",
  },
} satisfies ChartConfig;

/** Number of days spanned by the selected date range (inclusive). */
const getDaysInRange = (from?: Date, to?: Date) => {
  if (!from || !to) return 0;
  const ms = to.getTime() - from.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(days, 0);
};

const UsageCharts = () => {
  const { data } = useFetchCreditUsageSummary();
  const { dateRange } = useDateRangePickerStore();

  const creditChartData = data?.data.creditUsages || [];
  const executionCreditChartData = data?.data.executionCreditUsages || [];
  const llmCreditChartData = data?.data.llmCreditUsages || [];

  const daysInRange = getDaysInRange(dateRange?.from, dateRange?.to);
  const totalCredits = data?.data.usageSummary.totalCredits || 0;
  const averageDaily = daysInRange > 0 ? totalCredits / daysInRange : Number.NaN;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartLineInteractive
        title="Total credits used"
        total={totalCredits}
        data={creditChartData}
        chartConfig={totalCreditsChartConfig}
        valueKey="totalCount"
        average={averageDaily}
        className="col-span-2"
      />
      <ChartLineInteractive
        title="Total execution credits"
        total={data?.data.usageSummary.totalExecutionCredits || 0}
        data={executionCreditChartData}
        chartConfig={totalCreditsChartConfig}
        valueKey="totalCount"
        className="col-span-1"
      />
      <ChartLineInteractive
        title="Total LLM credits"
        total={data?.data.usageSummary.totalLlmCredits || 0}
        data={llmCreditChartData}
        chartConfig={totalCreditsChartConfig}
        valueKey="totalCount"
        className="col-span-1"
      />
    </div>
  );
};

export default UsageCharts;
