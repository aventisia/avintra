import { ViewContainer, ViewInfoRowsCard } from "@avplatform/ui/components/view-record";
import { JsonViewer, createCopyJsonAction } from "@avplatform/ui/json-viewer";
import { ScrollArea } from "@avplatform/ui/scroll";
import { LogsIcon, X } from "lucide-react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { Panel, PanelClose, PanelContent } from "@/components/panel/components/Panel";
import { buildNodeLogPayload } from "@/utils/node-log-payload";

import { NODE_DETAIL_PANEL_ID } from "../constants";
import { useExecutionStore } from "../stores/execution-log-store";
import { useNodeDetailStore } from "../stores/node-detail-store";

/**
 * Docked panel showing the selected node's execution log.
 *
 * Replaces the hover popover: the log is shown as raw JSON so every field the backend
 * persisted is visible, and the panel stays open while the user inspects values.
 *
 * Layout and payload mirror `CanvasNodeDetailPanel` (the live-run equivalent) so both
 * node-log surfaces look and behave identically.
 */
export const NodeDetailPanel = () => {
  const selectedNodeId = useNodeDetailStore((state) => state.selectedNodeId);

  const { executionMap, nodeToParentStack, activeIteration, nodeTypes } = useExecutionStore(
    useShallow((state) => ({
      executionMap: state.executionMap,
      nodeToParentStack: state.nodeToParentStack,
      activeIteration: state.activeIteration,
      nodeTypes: state.nodeTypes,
    })),
  );

  const nodeId = selectedNodeId;

  // Resolve the log for the currently selected iteration path.
  const parents = nodeId ? nodeToParentStack[nodeId] || [] : [];
  const pathKey = parents.map((id) => activeIteration[id] ?? 0).join("-") || "global";
  const log = nodeId ? executionMap[nodeId]?.[pathKey] : undefined;

  const nodeLogPayload = useMemo(
    () =>
      buildNodeLogPayload(log, {
        nodeType: nodeId ? nodeTypes[nodeId] : undefined,
      }),
    [log, nodeId, nodeTypes],
  );

  if (!nodeId) return null;

  return (
    <Panel id={NODE_DETAIL_PANEL_ID} side="right" width="w-[30rem]" closeOnEscape>
      <PanelContent className="overflow-hidden py-2 pl-2">
        <ScrollArea className="h-full w-full">
          <ViewContainer className="pt-1">
            <ViewInfoRowsCard
              title="Node Log"
              icon={<LogsIcon className="size-3.5 text-muted-foreground" />}
              action={
                <div className="flex items-center gap-1 pr-1">
                  {createCopyJsonAction(JSON.stringify(nodeLogPayload, null, 2))}
                  <PanelClose
                    className="h-6 w-6 p-0 -mr-1.5 text-muted-foreground/60 opacity-60 hover:text-primary hover:opacity-100"
                    aria-label="Close panel"
                  >
                    <X className="size-[1.2rem]" />
                  </PanelClose>
                </div>
              }
              className="border-0 bg-transparent p-0 pt-0 shadow-none"
              headerClassName="px-0"
              bodyClassName="pt-2 px-0 pr-2"
            >
              <JsonViewer
                jsonData={JSON.stringify(nodeLogPayload, null, 2)}
                enableValueClipboard
                viewportClassName=""
                parseNestedStrings
                shortenTextAfterLength={70}
              />
            </ViewInfoRowsCard>
          </ViewContainer>
        </ScrollArea>
      </PanelContent>
    </Panel>
  );
};
