import ErrorFetchingTemplate from "@/components/templates/ErrorFetchingTemplate";
import LoaderTemplate from "@/components/templates/LoaderTemplate";
import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { useTabStore } from "@/store/tab-store";

import { ScrollArea } from "@aventisia/ui/scroll";
// import { toast } from "@aventisia/ui/sonner";
import { toast } from "@aventisia/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { useShallow } from "zustand/react/shallow";

import { useFetchSetupFormData } from "../hooks/useFetchSetupFormData";
import SavingIndicator from "./setup/SavingIndicator";
import SummarizationModelSetupForm from "./setup/SummarizationModelSetupForm";
import SummarizationModelTestForm from "./test/SummarizationModelTestForm";

const SummarizationModel = () => {
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
      {/* Only ONE Tabs wrapper */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabClick}
        className="flex flex-col flex-1"
      >
        {" "}
        {/* Header and TabsList side by side */}
        <div className="flex items-center h-12 justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <p className="text-md font-medium">Summarization</p>
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
              className="rounded-full data-[state=active]:text-primary"
              disabled={isTestTabDisabled}
            >
              Test
            </TabsTrigger>
          </TabsList>
        </div>
        {/* Scrollable content */}
        <ScrollArea className="h-[calc(100vh-7.6rem)]">
          {isLoading ? (
            <LoaderTemplate />
          ) : isError ? (
            <ErrorFetchingTemplate />
          ) : (
            <>
              <TabsContent value="setup" className="h-full">
                <SummarizationModelSetupForm />
              </TabsContent>

              <TabsContent value="test" className="h-full">
                <SummarizationModelTestForm />
              </TabsContent>
            </>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default SummarizationModel;
