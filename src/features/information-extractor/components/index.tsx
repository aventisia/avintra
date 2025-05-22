import ErrorFetchingTemplate from "@/components/templates/ErrorFetchingTemplate";
import LoaderTemplate from "@/components/templates/LoaderTemplate";
import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { useTabStore } from "@/store/tab-store";

import { ScrollArea } from "@aventisia/ui/scroll";
import { toast } from "@aventisia/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { useShallow } from "zustand/react/shallow";

import { useFetchSetupFormData } from "../hooks/useFetchSetupFormData";
import InformationExtractorForm from "./setup/InformationExtractorForm";
import SavingIndicator from "./setup/SavingIndicator";
import InformationExtractorTestForm from "./test/InformationExtractorTestForm";

const InformationExtractor = () => {
  const { isLoading, isError } = useFetchSetupFormData();

  const { isDataSaving } = useAnnotationDataStore(
    useShallow((state) => ({
      isDataSaving: state.isDataSaving,
    })),
  );
  const { activeTab, setActiveTab } = useTabStore();
  const { data: modelData } = useFetchModel();

  // Disable "Test" tab when setupStatus is "Pending"
  const isTestTabDisabled = modelData?.data?.setupStatus === "Pending";

  // Handle Test tab click
  const handleTabClick = (tabValue: string) => {
    if (tabValue === "test" && isTestTabDisabled) {
      toast.error("Please configure the setup fields first.");
    } else {
      setActiveTab(tabValue);
    }
  };

  return (
    <div className="ml-2 rounded-lg bg-white shadow h-full flex flex-col">
      <Tabs
        value={activeTab}
        onValueChange={handleTabClick}
        className="flex flex-col flex-1"
      >
        {/* Header */}
        <div className="flex items-center h-12 justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <p className="text-md font-medium">Extraction</p>
            <SavingIndicator isSaving={isDataSaving} />
          </div>

          <TabsList className="rounded-full">
            <TabsTrigger
              value="setup"
              className="rounded-full data-[state=active]:text-primary"
            >
              Setup
            </TabsTrigger>
            <TabsTrigger
              value="test"
              disabled={isTestTabDisabled}
              className="rounded-full data-[state=active]:text-primary"
            >
              Test
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="h-[calc(100vh-7.6rem)">
          {isLoading ? (
            <LoaderTemplate />
          ) : isError ? (
            <ErrorFetchingTemplate />
          ) : (
            <>
              <TabsContent value="setup" className="h-full">
                <InformationExtractorForm />
              </TabsContent>

              <TabsContent value="test" className="h-full">
                <InformationExtractorTestForm />
              </TabsContent>
            </>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default InformationExtractor;
