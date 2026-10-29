import { useDocumentTitle } from "@avplatform/ui/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@avplatform/ui/tabs";

import LoaderTemplate from "@/components/templates/LoaderTemplate";

import { useFetchCreditUsageSummary } from "../hooks/useFetchCreditUsageSummary.ee";
import ByokModelCharts from "./ByokModelCharts.ee";
import ByokUsageTables from "./ByokUsageTables.ee";
import ChartsHeader from "./ChartsHeader.ee";
import ModelCharts from "./ModelCharts.ee";
import UsageCharts from "./UsageCharts.ee";
import UsageTables from "./UsageTables.ee";
import ExportDialog from "./export dialog/ExportDialog.ee";

export const CreditsUsage = () => {
  const { isLoading } = useFetchCreditUsageSummary();

  // Set the document title
  useDocumentTitle("Usage");

  return (
    <>
      <div className="space-y-6 py-4">
        {/* Header */}
        <ChartsHeader />

        <Tabs defaultValue="credits">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-none border-b bg-white px-3 text-base">
            <TabsTrigger
              value="credits"
              className="rounded-none data-[state=active]:border-b-black"
            >
              Platform Credits
            </TabsTrigger>
            <TabsTrigger value="byok" className="rounded-none data-[state=active]:border-b-black">
              BYOK Consumption
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credits" className="space-y-6 pt-4">
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
          </TabsContent>

          <TabsContent value="byok" className="space-y-6 pt-4">
            <>
              {/* BYOK consumption by model provider */}
              <div className="rounded-lg border bg-white px-6 py-4">
                <p className="mb-4 text-base font-medium">BYOK Consumption by Model</p>
                <ByokModelCharts />
              </div>

              {/* Users and Agents breakdown */}
              <ByokUsageTables />
            </>
          </TabsContent>
        </Tabs>
      </div>
      <ExportDialog />
    </>
  );
};
