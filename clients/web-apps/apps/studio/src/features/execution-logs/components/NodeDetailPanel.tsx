import { Button } from "@avplatform/ui/buttons";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { JsonViewer, createCopyJsonAction } from "@avplatform/ui/json-viewer";
import { ScrollArea } from "@avplatform/ui/scroll";
import { ArrowsInIcon, ArrowsOutIcon, XIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Panel, PanelClose, PanelContent } from "@/components/panel/components/Panel";
import { buildNodeLogPayload } from "@/utils/node-log-payload";

import { NODE_DETAIL_PANEL_ID } from "../constants";
import { useExecutionStore } from "../stores/execution-log-store";
import { useNodeDetailStore } from "../stores/node-detail-store";
import { NodeLogHeader } from "./NodeLogHeader";

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

  const { executionMap, nodeToParentStack, activeIteration, nodeTypes, nodeMeta } =
    useExecutionStore(
      useShallow((state) => ({
        executionMap: state.executionMap,
        nodeToParentStack: state.nodeToParentStack,
        activeIteration: state.activeIteration,
        nodeTypes: state.nodeTypes,
        nodeMeta: state.nodeMeta,
      })),
    );

  const [expanded, setExpanded] = useState(false);

  const nodeId = selectedNodeId;

  // Resolve the log for the currently selected iteration path.
  const parents = nodeId ? nodeToParentStack[nodeId] || [] : [];
  const pathKey = parents.map((id) => activeIteration[id] ?? 0).join("-") || "global";
  const log = nodeId ? executionMap[nodeId]?.[pathKey] : undefined;
  const meta = nodeId ? nodeMeta[nodeId] : undefined;

  const nodeLogPayload = useMemo(
    () =>
      buildNodeLogPayload(log, {
        nodeType: nodeId ? nodeTypes[nodeId] : undefined,
      }),
    [log, nodeId, nodeTypes],
  );

  if (!nodeId) return null;

  const storedName = nodeLogPayload.nodeDisplayName as string | undefined;
  const customName =
    meta?.label || (storedName !== FALLBACK_VALUE ? storedName : undefined) || nodeId;

  return (
    <Panel
      id={NODE_DETAIL_PANEL_ID}
      side="right"
      width={expanded ? "w-[46rem] max-w-[calc(100vw-2.5rem)]" : "w-[30rem]"}
      className="rounded-lg border-line bg-surface shadow-pop"
      closeOnEscape
    >
      <PanelContent className="flex flex-col overflow-hidden">
        <div className="flex min-h-12 shrink-0 items-center gap-2 border-b border-line py-1 pl-4 pr-2">
          <NodeLogHeader
            className="min-w-0 flex-1"
            customName={customName}
            builtInName={(nodeLogPayload.nodeUniqueName as string) || meta?.name}
            category={meta?.category}
            iconUrl={meta?.iconUrl}
            icon={meta?.icon}
            img={meta?.img}
          />
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon8"
              onClick={() => setExpanded((value) => !value)}
              aria-label={expanded ? "Narrow panel" : "Widen panel"}
              title={expanded ? "Narrow panel" : "Widen panel"}
              className="size-6 p-0 text-muted-foreground hover:text-ink"
            >
              {expanded ? (
                <ArrowsInIcon className="size-4" />
              ) : (
                <ArrowsOutIcon className="size-4" />
              )}
            </Button>
            {createCopyJsonAction(JSON.stringify(nodeLogPayload, null, 2))}
            <PanelClose
              className="size-6 p-0 text-muted-foreground hover:text-ink"
              aria-label="Close panel"
            >
              <XIcon className="size-4" />
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
