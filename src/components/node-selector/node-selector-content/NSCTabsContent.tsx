import { TabsContent } from "@/react-toolkit/ui/tabs";
import { NSCNodesList } from "./NSCNodesList";
import { activitiesList } from "@/data/activities-list";
import { logicNodesList } from "@/data/logic-nodes-list";

export const NSCTabsContent = () => {
  return (
    <>
      <TabsContent value="all" className="mt-[1px]">
        <NSCNodesList nodesList={[...activitiesList,...logicNodesList]} />
      </TabsContent>
      <TabsContent value="activities" className="mt-[1px]">
        <NSCNodesList nodesList={activitiesList} />
      </TabsContent>
      <TabsContent value="logical" className="mt-[1px]">
        <NSCNodesList nodesList={logicNodesList} />
      </TabsContent>
      <TabsContent value="connectors" className="mt-[1px]">
        <NSCNodesList nodesList={activitiesList} />
      </TabsContent>
    </>
  );
};
