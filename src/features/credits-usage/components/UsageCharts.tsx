import { totalCredits } from "../constants/total-credits-data";
import { ChartLineInteractive } from "../shared/charts/LineChart";

const UsageCharts = () => {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartLineInteractive title="Total Credits Used" data={totalCredits} />
      <ChartLineInteractive title="Total Transactions" data={totalCredits} />
    </div>
  );
};

export default UsageCharts;
