import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";

import { FineTuneTable } from "./fine-tune-table/FineTuneTable";
import { HistoryTable } from "./history-table/HistoryTable";

const DynamicTableContainer = () => {
  return (
    <Tabs defaultValue="fine-tune" className="space-y-4">
      <TabsList className="bg-slate-200 rounded-full mt-2">
        <TabsTrigger
          value="fine-tune"
          className="rounded-full data-[state=active]:text-primary text-xs"
        >
          Fine-tune
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="rounded-full data-[state=active]:text-primary text-xs"
        >
          History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="fine-tune">
        <FineTuneTable />
      </TabsContent>

      <TabsContent value="history">
        <HistoryTable />
      </TabsContent>
    </Tabs>
  );
};

export default DynamicTableContainer;
