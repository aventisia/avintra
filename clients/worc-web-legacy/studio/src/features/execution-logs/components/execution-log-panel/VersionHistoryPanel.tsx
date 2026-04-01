import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/panel/components/Panel";

import { ScrollArea } from "@aventisia/ui/scroll";

import { PANEL_ID } from "../../constants";
import { VersionHistoryCloseButton } from "./VersionHistoryCloseButton";
import VersionHistoryContent from "./VersionHistoryContent";

export const VersionHistoryPanel = () => {
  return (
    <Panel
      id={PANEL_ID}
      width="w-[21rem]"
      className="rounded-none"
      closeOnEscape={false}
      side="left"
    >
      <PanelHeader>
        <PanelTitle className="text-[1rem] font-medium">
          Execution Logs
        </PanelTitle>
        <VersionHistoryCloseButton />
      </PanelHeader>
      <PanelContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <VersionHistoryContent />
        </ScrollArea>
      </PanelContent>
    </Panel>
  );
};
