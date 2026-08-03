import { ScrollArea } from "@avplatform/ui/scroll";

import {
  Panel,
  // PanelClose,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/panel/components/Panel";

import { PANEL_ID } from "../../constants";
import VersionHistoryContent from "./VersionHistoryContent";

export const VersionHistoryPanel = () => {
  return (
    <Panel id={PANEL_ID} width="w-[21rem]" className="rounded-none" closeOnEscape={false}>
      <PanelHeader>
        <PanelTitle className="text-[1rem] font-medium">Change History</PanelTitle>
      </PanelHeader>
      <PanelContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <VersionHistoryContent />
        </ScrollArea>
      </PanelContent>
    </Panel>
  );
};
