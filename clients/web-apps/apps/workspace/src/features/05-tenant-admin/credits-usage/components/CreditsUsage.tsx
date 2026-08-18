import { useDocumentTitle } from "@avplatform/ui/hooks";

import LoaderTemplate from "@/components/templates/LoaderTemplate";

import { useFetchCreditUsageSummary } from "../hooks/useFetchCreditUsageSummary";
import ChartsHeader from "./ChartsHeader";
import ModelCharts from "./ModelCharts";
import UsageCharts from "./UsageCharts";
import UsageTables from "./UsageTables";
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

            {/* LLM / model credits by service */}
            <div className="rounded-lg border bg-white px-6 py-4">
              <p className="mb-4 text-base font-medium">LLM Credits by Model</p>
              <ModelCharts />
            </div>

            {/* Users and Agents breakdown */}
            <UsageTables />
          </>
        )}
      </div>
      <ExportDialog />
    </>
  );
};
