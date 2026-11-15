import { ScrollArea } from "@avplatform/ui/scroll";

import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/panel/components/Panel";
import {
  LEFT_DOCK_PANEL_CLASS,
  LEFT_DOCK_PANEL_WIDTH,
  LEFT_DOCK_SCROLL_CLASS,
  LEFT_DOCK_TITLE_CLASS,
} from "@/components/panel/left-dock-panel.constant";

import { PANEL_ID } from "../../constants";
import VersionHistoryContent from "./VersionHistoryContent";

export const VersionHistoryPanel = () => {
  return (
    <Panel
      id={PANEL_ID}
      side="left"
      width={LEFT_DOCK_PANEL_WIDTH}
      className={LEFT_DOCK_PANEL_CLASS}
      closeOnEscape={false}
    >
      <PanelHeader>
        <PanelTitle className={LEFT_DOCK_TITLE_CLASS}>Change history</PanelTitle>
      </PanelHeader>
      <PanelContent>
        <ScrollArea className={LEFT_DOCK_SCROLL_CLASS}>
          <VersionHistoryContent />
        </ScrollArea>
      </PanelContent>
    </Panel>
  );
};
