import { TabsContent } from "@/react-toolkit/ui/tabs";
import { NSCActivitiesList } from "./NSCActivitiesList";
import { NodeSelectorOriginType } from "@/types/node-selector-origin-type";
import { NSCLogicNodesList } from "./NSCLogicNodesList";

interface NSCTabsContentProps {
  origin: NodeSelectorOriginType;
  originId: string;
}

export const NSCTabsContent = ({ origin, originId }: NSCTabsContentProps) => {
  return (
    <>
      <TabsContent value="all" className="mt-[1px]">
        <NSCActivitiesList origin={origin} originId={originId} />
      </TabsContent>
      <TabsContent value="activities" className="mt-[1px]">
        <NSCActivitiesList origin={origin} originId={originId} />
      </TabsContent>
      <TabsContent value="logical" className="mt-[1px]">
        <NSCLogicNodesList origin={origin} originId={originId} />
      </TabsContent>
      <TabsContent value="connectors" className="mt-[1px]">
        <NSCActivitiesList origin={origin} originId={originId} />
      </TabsContent>
    </>
  );
};
