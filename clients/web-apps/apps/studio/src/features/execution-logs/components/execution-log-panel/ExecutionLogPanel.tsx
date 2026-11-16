import { ScrollArea } from "@avplatform/ui/scroll";
import { useState } from "react";

import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/panel/components/Panel";
import {
  LEFT_DOCK_PANEL_CLASS,
  LEFT_DOCK_PANEL_WIDTH,
  LEFT_DOCK_SCROLL_CLASS,
  LEFT_DOCK_TITLE_CLASS,
} from "@/components/panel/left-dock-panel.constant";

import { PANEL_ID } from "../../constants";
import ExecutionLogContent from "./ExecutionLogContent";
import { ExecutionLogFilter } from "./ExecutionLogFilter";

interface Props {
  /** True while the canvas is showing a sub-flow of the selected job's run. */
  isSubFlowView?: boolean;
}

export const ExecutionLogPanel = ({ isSubFlowView = false }: Props) => {
  const [errorsOnly, setErrorsOnly] = useState(false);

  return (
    <Panel
      id={PANEL_ID}
      side="left"
      width={LEFT_DOCK_PANEL_WIDTH}
      className={LEFT_DOCK_PANEL_CLASS}
      closeOnEscape={false}
    >
      <PanelHeader>
        <PanelTitle className={LEFT_DOCK_TITLE_CLASS}>Run log</PanelTitle>
        {!isSubFlowView && <ExecutionLogFilter errorsOnly={errorsOnly} onChange={setErrorsOnly} />}
      </PanelHeader>
      <PanelContent>
        <ScrollArea className={LEFT_DOCK_SCROLL_CLASS}>
          {/*
            The list stays MOUNTED and is only hidden while inside a sub-flow. Unmounting it
            would remount on the way back, and `useFetchExecutionLogsList` uses
            `refetchOnMount: "always"` — so returning from a sub-flow would refetch the job
            list again. Hiding keeps the cached query alive.
          */}
          <div className={isSubFlowView ? "hidden" : undefined}>
            <ExecutionLogContent errorsOnly={errorsOnly} />
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
      <p className="text-body-sm font-medium text-ink">Viewing a sub-flow</p>
      <p className="text-body-sm text-muted-foreground">
        Execution logs are listed for the main flow. Use the breadcrumb above the canvas to go back
        to the main flow and switch between runs.
      </p>
    </div>
  );
};
