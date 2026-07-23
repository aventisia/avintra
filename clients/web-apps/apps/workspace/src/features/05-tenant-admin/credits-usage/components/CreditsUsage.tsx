import { useDocumentTitle } from "@avplatform/ui/hooks";

import LoaderTemplate from "@/components/templates/LoaderTemplate";

import { useFetchCreditUsageSummary } from "../hooks/useFetchCreditUsageSummary";
import ChartsHeader from "./ChartsHeader";
import ServiceCharts from "./ServiceCharts";
import UsageCharts from "./UsageCharts";
import UsageTabs from "./UsageTabs";
import ExportDialog from "./export dialog/ExportDialog";

export const CreditsUsage = () => {
  const { isLoading } = useFetchCreditUsageSummary();

  // Set the document title
  useDocumentTitle("Usage");

  return (
    <>
      <div className="space-y-6 py-4">
        {/* Header */}
        <ChartsHeader />

        {isLoading ? (
          <LoaderTemplate />
        ) : (
          <>
            {/* Usage Charts */}
            <UsageCharts />

            {/* Service charts */}
            <div className="grid grid-cols-[3fr_1fr] rounded-lg border">
              <ServiceCharts />
              <UsageTabs />
            </div>
          </>
        )}
      </div>
      <ExportDialog />
    </>
  );
};
