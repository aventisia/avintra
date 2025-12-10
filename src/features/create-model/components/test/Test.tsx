import JsonViewer from "./JsonViewer";
import { TabsContent } from "@aventisia/ui/tabs";

const TestContent = () => {
  return (
    <TabsContent value="Test" className="px-1 py-2">
      <JsonViewer jsonData={JSON.stringify({})} />
    </TabsContent>
  );
};

export default TestContent;
