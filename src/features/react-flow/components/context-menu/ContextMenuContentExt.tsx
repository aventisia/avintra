import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useFlowOperations } from "@/features/react-flow/hooks/useFlowOperations";
import {
  ContextMenuContent,
  ContextMenuSeparator,
} from "@aventisia/ui/context-menu";
import { DeleteCMItem, SimpleCMItem } from "@aventisia/ui/context-menu";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";
import {
  Library,
  GroupIcon,
  UngroupIcon,
  CircleCheckIcon,
  BanIcon,
  Scissors,
  Copy,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  XCircle,
} from "lucide-react";
import { useNodeGrouping } from "../../hooks/useNodeGrouping";
import { FBCreateButton } from "@/features/flow-block/components/flow-block-crud-dialog/FBCreateButton";
import { useClipboardStore } from "../../stores/useClipboardStore";
import { useEffect } from "react";

export const ContextMenuContentExt = () => {
  // Auto layout the flow
  const autoLayout = useDagreAutoLayout();
  console.log("rendering inner");
  // Get selected nodes/edges
  const { selectedNode, selectedEdge, setSelectedEdge, setSelectedNode } =
    useContextMenuActionsStore();

  const { groupNodes, ungroupNodes } = useNodeGrouping();

  const {
    copyNodes,
    cutNodes,
    pasteNodes,
    deleteNode,
    disableNode,
    cancelCut,
  } = useFlowOperations();

  const clipboard = useClipboardStore((state) => state.clipboard);
  const clipboardNodes = clipboard?.nodes || [];
  const hasClipboardData = clipboardNodes.length > 0;

  const hasBranchNode = clipboardNodes.some((n) => n.type === "branchNode1");
  const hasConditionalNode = clipboardNodes.some(
    (n) => n.type === "conditionalNode",
  );

  // Prevent pasting a full conditional node inside another branch slot
  const isClipboardBranch = hasBranchNode && !hasConditionalNode;

  // Evaluate the currently right-clicked node
  const isGroupHead = selectedNode?.data?.isGroupHead;
  const isGroupMember = selectedNode?.data?.groupId;
  const isDisabled = selectedNode?.data?.isDisabled;
  const isBranchNode = selectedNode?.type === "branchNode1";

  const isNodeUnderCut =
    selectedNode &&
    clipboard?.operation === "cut" &&
    clipboardNodes.some((n) => n.id === selectedNode.id);

  // Replaces the old `onOpenChange={(!open) => ...}` logic.
  // This cleans up selections and organizes the layout when the menu unmounts (closes).
  useEffect(() => {
    return () => {
      setSelectedNode(null);
      setSelectedEdge(null);
    };
  }, []);
  return (
    <ContextMenuContent className="w-48">
      {isNodeUnderCut ? (
        <SimpleCMItem
          size="sm"
          content="Cancel Cut"
          Icon={XCircle}
          onClick={() => cancelCut()}
        />
      ) : (
        <>
          {/* FIX: Removed the condition hiding Cut for branches. Now supports both. */}
          <SimpleCMItem
            size="sm"
            content={isBranchNode ? "Cut Branch" : "Cut"}
            Icon={Scissors}
            shortCut="Ctrl+X"
            disabled={!selectedNode}
            onClick={() => cutNodes()}
          />

          <SimpleCMItem
            size="sm"
            content={isBranchNode ? "Copy Branch" : "Copy"}
            Icon={Copy}
            shortCut="Ctrl+C"
            disabled={!selectedNode}
            onClick={() => copyNodes()}
          />

          <ContextMenuSeparator className="h-[0.5px]" />

          {isBranchNode ? (
            <>
              <SimpleCMItem
                size="sm"
                content="Paste Branch Before"
                Icon={ArrowLeft}
                disabled={!hasClipboardData || !isClipboardBranch}
                onClick={() =>
                  selectedNode && pasteNodes(selectedNode.id, "branch-before")
                }
              />
              <SimpleCMItem
                size="sm"
                content="Paste Branch After"
                Icon={ArrowRight}
                disabled={!hasClipboardData || !isClipboardBranch}
                onClick={() =>
                  selectedNode && pasteNodes(selectedNode.id, "branch-after")
                }
              />
            </>
          ) : (
            <>
              <SimpleCMItem
                size="sm"
                content="Paste Above"
                Icon={ArrowUp}
                disabled={
                  !selectedNode || !hasClipboardData || isClipboardBranch
                }
                onClick={() =>
                  selectedNode && pasteNodes(selectedNode.id, "above")
                }
              />
              <SimpleCMItem
                size="sm"
                content="Paste Below"
                Icon={ArrowDown}
                disabled={
                  !selectedNode || !hasClipboardData || isClipboardBranch
                }
                onClick={() =>
                  selectedNode && pasteNodes(selectedNode.id, "below")
                }
              />
            </>
          )}

          <ContextMenuSeparator className="h-[0.5px]" />

          {isGroupHead ? (
            <>
              <SimpleCMItem
                size="sm"
                content="Ungroup"
                Icon={UngroupIcon}
                onClick={() => ungroupNodes()}
              />
              {import.meta.env.MODE !== "production" &&
                selectedNode?.type !== "blockNode" &&
                !selectedNode?.data?.hasBlock && (
                  <>
                    <ContextMenuSeparator className="h-[0.5px]" />
                    <FBCreateButton />
                  </>
                )}
            </>
          ) : isGroupMember ? null : (
            <SimpleCMItem
              size="sm"
              content="Group up"
              Icon={GroupIcon}
              onClick={() => groupNodes()}
            />
          )}

          <SimpleCMItem
            size="sm"
            content="Organize"
            Icon={Library}
            onClick={() => autoLayout()}
          />

          {isDisabled ? (
            <SimpleCMItem
              size="sm"
              content="Enable"
              Icon={CircleCheckIcon}
              onClick={() => disableNode(false)}
            />
          ) : (
            <SimpleCMItem
              size="sm"
              content="Disable"
              Icon={BanIcon}
              onClick={() => disableNode(true)}
            />
          )}

          <ContextMenuSeparator className="h-[0.5px]" />

          <DeleteCMItem
            size="sm"
            disabled={!selectedNode && !selectedEdge}
            onClick={() => selectedNode && deleteNode(selectedNode.id)}
          />
        </>
      )}
    </ContextMenuContent>
  );
};
