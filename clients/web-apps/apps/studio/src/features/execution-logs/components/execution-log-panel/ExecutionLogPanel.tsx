import { ScrollArea } from "@avplatform/ui/scroll";
import { useState } from "react";

import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/panel/components/Panel";

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
      width="w-[21rem]"
      className="left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] rounded-none duration-200 animate-in fade-in-0 slide-in-from-top-1 motion-reduce:animate-none"
      closeOnEscape={false}
    >
      <PanelHeader>
        <PanelTitle>Run log</PanelTitle>
        {!isSubFlowView && <ExecutionLogFilter errorsOnly={errorsOnly} onChange={setErrorsOnly} />}
      </PanelHeader>
      <PanelContent>
        <ScrollArea className="h-[calc(100vh-7.5rem)]">
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
