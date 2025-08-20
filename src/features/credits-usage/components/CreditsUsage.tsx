import ChartsHeader from "./ChartsHeader";
import ExportDialog from "./export dialog/ExportDialog";
import ServiceCharts from "./ServiceCharts";
import UsageCharts from "./UsageCharts";
import UsageTabs from "./UsageTabs";

export const CreditsUsage = () => {
  return (
    <>
      <div className="space-y-6 py-4">
        {/* Header */}
        <ChartsHeader />

        {/* Usage Charts */}
        <UsageCharts />

        {/* Service charts */}
        <div className="grid grid-cols-[3fr_1fr] rounded-lg border pb-4">
          <ServiceCharts />
          <UsageTabs />
        </div>
      </div>
      <ExportDialog />
    </>
  );
};
