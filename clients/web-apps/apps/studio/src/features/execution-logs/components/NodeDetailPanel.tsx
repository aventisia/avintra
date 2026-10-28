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
    <Panel
      id={NODE_DETAIL_PANEL_ID}
      side="right"
      width="w-[30rem]"
      className="rounded-lg border-line bg-surface shadow-pop"
      closeOnEscape
    >
      <PanelContent className="flex flex-col overflow-hidden">
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-line pl-4 pr-2">
          <LogsIcon className="size-3.5 text-muted-foreground" />
          <span className="text-body-sm font-semibold text-ink">Node log</span>
          <div className="ml-auto flex items-center gap-1">
            {createCopyJsonAction(JSON.stringify(nodeLogPayload, null, 2))}
            <PanelClose
              className="size-6 p-0 text-muted-foreground hover:text-ink"
              aria-label="Close panel"
            >
              <X className="size-4" />
            </PanelClose>
          </div>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-4">
            <JsonViewer
              jsonData={JSON.stringify(nodeLogPayload, null, 2)}
              enableValueClipboard
              viewportClassName=""
              parseNestedStrings
              shortenTextAfterLength={70}
              className="rounded-md border border-line bg-sunken px-3 pt-2 font-mono text-code"
            />
          </div>
        </ScrollArea>
      </PanelContent>
    </Panel>
  );
};
