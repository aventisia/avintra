import { ScrollArea } from "@avplatform/ui/scroll";

import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/panel/components/Panel";

import { PANEL_ID } from "../../constants";
import { ExecutionLogCloseButton } from "./ExecutionLogCloseButton";
import ExecutionLogContent from "./ExecutionLogContent";

interface Props {
  /** True while the canvas is showing a sub-flow of the selected job's run. */
  isSubFlowView?: boolean;
}

export const ExecutionLogPanel = ({ isSubFlowView = false }: Props) => {
  return (
    <Panel id={PANEL_ID} width="w-[21rem]" className="rounded-lg" closeOnEscape={false} side="left">
      <PanelHeader>
        <PanelTitle className="text-[1rem] font-medium">Executions</PanelTitle>
        <ExecutionLogCloseButton />
      </PanelHeader>
      <PanelContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {/*
            The list stays MOUNTED and is only hidden while inside a sub-flow. Unmounting it
            would remount on the way back, and `useFetchExecutionLogsList` uses
            `refetchOnMount: "always"` — so returning from a sub-flow would refetch the job
            list again. Hiding keeps the cached query alive.
          */}
          <div className={isSubFlowView ? "hidden" : undefined}>
            <ExecutionLogContent />
          </div>
          {isSubFlowView && <SubFlowNotice />}
        </ScrollArea>
      </PanelContent>
    </Panel>
  );
};

/**
 * Shown instead of the execution list while the canvas is inside a sub-flow. The sub-flow's
 * node logs belong to the job already selected, so switching jobs here would map another
 * run's logs onto this graph. The user returns to the root flow via the breadcrumb.
 */
const SubFlowNotice = () => {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <p className="text-sm font-medium text-foreground">Viewing a sub-flow</p>
      <p className="text-xs text-muted-foreground">
        Execution logs are listed for the main flow. Use the breadcrumb above the canvas to go
        back to the main flow and switch between runs.
      </p>
    </div>
  );
};
