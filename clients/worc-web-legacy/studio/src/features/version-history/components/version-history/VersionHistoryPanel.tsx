import {
  Panel,
  // PanelClose,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/panel/components/Panel";
import { PANEL_ID } from "../../constants";
import VersionHistoryContent from "./VersionHistoryContent";
import { ScrollArea } from "@aventisia/ui/scroll";

export const VersionHistoryPanel = () => {
  return (
    <Panel id={PANEL_ID} width="w-[21rem]" closeOnEscape={false}>
      <PanelHeader>
        <PanelTitle className="w- text-[1rem] font-medium">
          Change History
        </PanelTitle>
      </PanelHeader>
      <PanelContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <VersionHistoryContent />
        </ScrollArea>
      </PanelContent>
    </Panel>
  );
};
