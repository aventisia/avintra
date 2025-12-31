// import ErrorFetchingTemplate from "@/components/templates/ErrorFetchingTemplate";
// import LoaderTemplate from "@/components/templates/LoaderTemplate";
import ExtractViaLLMButton from "@/components/extract-via-llm/ExtractViaLLMButton";
import LoaderTemplate from "@/components/templates/LoaderTemplate";
import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";
import { useTabStore } from "@/store/tab-store";

import { ScrollArea } from "@aventisia/ui/scroll";
//import { toast } from "@aventisia/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { useShallow } from "zustand/react/shallow";

import { useFetchSetupFormData } from "../hooks/useFetchSetupFormData";
import InferenceModelSetupForm from "./InferenceModelSetupForm";
import InferenceModelTestForm from "./InferenceModelTestForm";
import SavingIndicator from "./SavingIndicator";

const InferenceModel = () => {
  const { isLoading } = useFetchSetupFormData();

  const { isDataSaving } = useAnnotationDataStore(
    useShallow((state) => ({
      isDataSaving: state.isDataSaving,
    })),
  );
  const { activeTab, setActiveTab } = useTabStore();
  const { data: modelData } = useFetchProjectMetaData();

  // Disable "Test" tab when setupStatus is "Pending"
  const isTestTabDisabled = modelData?.data?.setupStatus === "Pending";

  // Handle Test tab click
  const handleTabClick = (tabValue: string) => {
    // TODO: Temporary fix since pending status is not updating correctly
    setActiveTab(tabValue);

    if (tabValue === "test" && isTestTabDisabled) {
      //toast.error("Please configure the setup fields first.");
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
            <p className="text-md font-medium">Inferencing Model</p>
            <SavingIndicator isSaving={isDataSaving} />
          </div>
          <div className="flex items-center gap-1">
            <ExtractViaLLMButton />
            <TabsList className="rounded-full">
              <TabsTrigger
                value="setup"
                className="rounded-full data-[state=active]:text-primary"
              >
                Setup
              </TabsTrigger>
              <TabsTrigger
                value="test"
                className={`rounded-full data-[state=active]:text-primary ${isTestTabDisabled && "opacity-50 cursor-default"}`}
              >
                Test
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        {/* Scrollable content */}
        <ScrollArea className="h-[calc(100vh-7.6rem)]">
          {/* {isLoading ? (
            <LoaderTemplate />
          ) : isError ? (
            <ErrorFetchingTemplate />
          ) : ( */}
          <>
            <TabsContent value="setup" className="h-full">
              {isLoading ? <LoaderTemplate /> : <InferenceModelSetupForm />}
            </TabsContent>

            <TabsContent value="test" className="h-full">
              <InferenceModelTestForm />
            </TabsContent>
          </>
          {/* )} */}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default InferenceModel;
