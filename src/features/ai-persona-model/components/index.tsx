import ErrorFetchingTemplate from "@/components/templates/ErrorFetchingTemplate";
import LoaderTemplate from "@/components/templates/LoaderTemplate";
import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";
import { useTabStore } from "@/store/tab-store";

import { ScrollArea } from "@aventisia/ui/scroll";
import { toast } from "@aventisia/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { useShallow } from "zustand/react/shallow";

import { useFetchSetupFormData } from "../hooks/useFetchSetupFormData";
import { useTempChatStore } from "../store/temp-chat-store";
import AIPersonaSetupForm from "./setup/AIPersonaSetupForm";
import SavingIndicator from "./setup/SavingIndicator";
import AIPersonaTestForm from "./test/AIPersonaTestForm";

const AIPersonaModel = () => {
  const { isLoading, isError } = useFetchSetupFormData();

  // -----------------------------------------------
  const {
    chatConfig: { assistantName },
  } = useTempChatStore(
    useShallow((state) => ({
      chatConfig: state.chatConfig,
    })),
  );
  // -----------------------------------------------

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
    if (tabValue === "test" && isTestTabDisabled) {
      toast.error("Please configure the setup fields first.");
    } else {
      setActiveTab(tabValue);
    }
  };

  return (
    <div className="rounded-lg bg-white shadow h-full flex flex-col max-w-screen-lg mx-auto self-center">
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
            <p className="text-md font-medium">
              AI Persona {activeTab === "test" ? `- ${assistantName}` : ""}
            </p>
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
              className={`rounded-full data-[state=active]:text-primary ${isTestTabDisabled && "opacity-50 cursor-default"}`}
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
                <AIPersonaSetupForm />
              </TabsContent>

              <TabsContent value="test" className="h-full">
                <AIPersonaTestForm />
              </TabsContent>
            </>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default AIPersonaModel;
