import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/panel/components/Panel";

import { ScrollArea } from "@aventisia/ui/scroll";

import { PANEL_ID } from "../../constants";
import { ExecutionLogCloseButton } from "./ExecutionLogCloseButton";
import ExecutionLogContent from "./ExecutionLogContent";

export const ExecutionLogPanel = () => {
  return (
    <Panel
      id={PANEL_ID}
      width="w-[21rem]"
      className="rounded-lg"
      closeOnEscape={false}
      side="left"
    >
      <PanelHeader>
        <PanelTitle className="text-[1rem] font-medium">Executions</PanelTitle>
        <ExecutionLogCloseButton />
      </PanelHeader>
      <PanelContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <ExecutionLogContent />
        </ScrollArea>
      </PanelContent>
    </Panel>
  );
};
