import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";

import { ScrollArea } from "@aventisia/ui/scroll";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { useShallow } from "zustand/react/shallow";

import SavingIndicator from "./setup/SavingIndicator";
import SentimentAnalyticsForm from "./setup/SentimentAnalyticsForm";
import SentimentAnalyticsFormTestForm from "./test/SentimentAnalysisTestForm";

const SentimentAnalytics = () => {
  const { isDataSaving } = useAnnotationDataStore(
    useShallow((state) => ({
      isDataSaving: state.isDataSaving,
    })),
  );

  return (
    <div className="ml-2 rounded-lg bg-white shadow h-full flex flex-col">
      {/* Only ONE Tabs wrapper */}
      <Tabs defaultValue="setup" className="flex flex-col flex-1">
        {/* Header and TabsList side by side */}
        <div className="flex items-center h-12 justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <p className="text-md font-medium">Sentiment Analytics</p>
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
            >
              Test
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="h-[calc(100vh-7.6rem)]">
          <TabsContent value="setup" className="h-full">
            <SentimentAnalyticsForm />
          </TabsContent>

          <TabsContent value="test" className="h-full">
            <SentimentAnalyticsFormTestForm />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default SentimentAnalytics;
