import { Separator } from "@avplatform/ui";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BooksIcon,
  CheckCircleIcon,
  CopyIcon,
  ProhibitIcon,
  ScissorsIcon,
  SelectionPlusIcon,
  SelectionSlashIcon,
  TrashIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { memo, useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useFlowOperations } from "@/features/react-flow/hooks/useFlowOperations";
import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { useNodeGrouping } from "../../hooks/useNodeGrouping";
import { useClipboardStore } from "../../stores/useClipboardStore";
import MenuItem from "./MenuItem";

export const ReactFlowContextMenu = memo(() => {
  const { menu, setMenu, selectedNode, selectedEdge, setSelectedEdge, setSelectedNode } =
    useContextMenuActionsStore(
      useShallow((state) => ({
        menu: state.menu,
        setMenu: state.setMenu,
        selectedNode: state.selectedNode,
        selectedEdge: state.selectedEdge,
        setSelectedEdge: state.setSelectedEdge,
        setSelectedNode: state.setSelectedNode,
      })),
    );
  const flowType = useReactFlowExtStore((state) => state.flowType);
  const { copyNodes, cutNodes, pasteNodes, deleteNode, disableNode, cancelCut } =
    useFlowOperations();
  const { groupNodes, ungroupNodes } = useNodeGrouping();
  const autoLayout = useDagreAutoLayout();
  const clipboard = useClipboardStore((state) => state.clipboard);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as globalThis.Node)) {
        setMenu(null);
      }
    };
    if (menu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menu, setMenu]);

  const resetContextMenu = useCallback(() => {
    setMenu(null);
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setMenu, setSelectedEdge, setSelectedNode]);
  if (!menu) return null;
  // ChatAgent has no canvas actions — never show custom menu.
  if (flowType === FlowTypesEnum.ChatAgent) return null;

  const isPaneMode = !selectedNode && !selectedEdge;
  const restrictedTypes = [
    "triggerNode",
    "flowEndNode",
    "branchStartNode",
    "branchEndNode",
    "mergeBranchesNode",
    "modelNode",
  ];

  const isPaneOrStartOrEnd = isPaneMode || restrictedTypes.includes(selectedNode?.type ?? "");

  const clipboardNodes = clipboard?.nodes || [];
  const hasClipboardData = clipboardNodes.length > 0;

  const isBranchNode = selectedNode?.type === "branchNode1";
  const isDefaultBranchNode =
    selectedNode?.type === "branchNode1" && selectedNode.data.name == "DefaultBranch";
  const hasBranchNode = clipboardNodes.some((n) => n.type === "branchNode1");
  const hasConditionalNode = clipboardNodes.some((n) => n.type === "conditionalNode");
  const isClipboardBranch = hasBranchNode && !hasConditionalNode;
  const isNodeUnderCut =
    selectedNode &&
    clipboard?.operation === "cut" &&
    clipboardNodes.some((n) => n.id === selectedNode.id);

  const isGroupHead = selectedNode?.data?.isGroupHead;
  const isGroupMember = selectedNode?.data?.groupId;
  const isDisabled = selectedNode?.data?.isDisabled;

  return (
    <div
      ref={menuRef}
      style={{
        top: menu.top,
        left: menu.left,
        right: menu.right,
        bottom: menu.bottom,
      }}
      className="absolute z-[1000] min-w-[12rem] overflow-hidden rounded-md bg-popover p-1 text-popover-foreground shadow-pop animate-in fade-in-80 zoom-in-95"
    >
      {isNodeUnderCut ? (
        <MenuItem
          icon={<XCircleIcon size={14} />}
          label="Cancel cut"
          onClick={() => {
            cancelCut();
          }}
        />
      ) : (
        <>
          <MenuItem
            icon={<ScissorsIcon size={14} />}
            label={isBranchNode ? "Cut branch" : "Cut"}
            shortcut="Ctrl+x"
            disabled={isPaneOrStartOrEnd || isDefaultBranchNode || !selectedNode}
            onClick={() => {
              cutNodes();
            }}
          />
          <MenuItem
            icon={<CopyIcon size={14} />}
            label={isBranchNode ? "Copy branch" : "Copy"}
            shortcut="Ctrl+c"
            disabled={isPaneOrStartOrEnd || isDefaultBranchNode || !selectedNode}
            onClick={() => {
              copyNodes();
            }}
          />

          <Separator className="my-0.5" />

          {isBranchNode ? (
            <>
              <MenuItem
                icon={<ArrowUpIcon size={14} />}
                label="Paste above"
                shortcut="Ctrl+shift+v"
                disabled={
                  isPaneOrStartOrEnd ||
                  !hasClipboardData ||
                  isDefaultBranchNode ||
                  !isClipboardBranch
                }
                onClick={() => {
                  if (selectedNode) pasteNodes(selectedNode.id, "branch-above");
                }}
              />
              <MenuItem
                icon={<ArrowDownIcon size={14} />}
                label="Paste below"
                shortcut="Ctrl+v"
                disabled={
                  isPaneOrStartOrEnd ||
                  !hasClipboardData ||
                  isDefaultBranchNode ||
                  !isClipboardBranch
                }
                onClick={() => {
                  if (selectedNode) pasteNodes(selectedNode.id, "branch-below");
                }}
              />
            </>
          ) : (
            <>
              <MenuItem
                icon={<ArrowLeftIcon size={14} />}
                label="Paste before"
                shortcut="Ctrl+shift+v"
                disabled={
                  isPaneOrStartOrEnd || !selectedNode || !hasClipboardData || isClipboardBranch
                }
                onClick={() => {
                  if (selectedNode) pasteNodes(selectedNode.id, "before");
                }}
              />
              <MenuItem
                icon={<ArrowRightIcon size={14} />}
                label="Paste after"
                shortcut="Ctrl+v"
                disabled={
                  isPaneOrStartOrEnd || !selectedNode || !hasClipboardData || isClipboardBranch
                }
                onClick={() => {
                  if (selectedNode) pasteNodes(selectedNode.id, "after");
                }}
              />
            </>
          )}

          <Separator className="my-0.5" />

          {isGroupHead ? (
            <>
              <MenuItem
                icon={<SelectionSlashIcon size={14} />}
                label="Ungroup"
                disabled={isPaneOrStartOrEnd || isDefaultBranchNode}
                onClick={() => {
                  ungroupNodes();
                }}
              />
              {/* {import.meta.env.MODE !== "production" &&
                selectedNode?.type !== "blockNode" &&
                !selectedNode?.data?.hasBlock && (
                  <>
                    <Separator className="my-0.5" />
                    <div className="px-2 py-1">
                      <FBCreateButton />
                    </div>
                  </>
                )} */}
            </>
          ) : (
            !isGroupMember && (
              <MenuItem
                icon={<SelectionPlusIcon size={14} />}
                label="Group up"
                disabled={
                  isPaneOrStartOrEnd || isBranchNode || isDefaultBranchNode || !selectedNode
                }
                onClick={() => {
                  groupNodes();
                }}
              />
            )
          )}

          <MenuItem
            icon={<BooksIcon size={14} />}
            label="Organize"
            onClick={() => {
              autoLayout();
              resetContextMenu();
            }}
          />

          <MenuItem
            icon={isDisabled ? <CheckCircleIcon size={14} /> : <ProhibitIcon size={14} />}
            label={isDisabled ? "Enable" : "Disable"}
            disabled={isPaneOrStartOrEnd || !selectedNode}
            onClick={() => {
              disableNode(!isDisabled);
            }}
          />

          <Separator className="my-0.5" />

          <MenuItem
            icon={<TrashIcon size={14} />}
            label="Delete"
            shortcut="DEL"
            isDestructive
            disabled={(isPaneOrStartOrEnd || isDefaultBranchNode) && !selectedEdge}
            onClick={() => {
              if (selectedNode) deleteNode(selectedNode.id);
            }}
          />
        </>
      )}
    </div>
  );
});

ReactFlowContextMenu.displayName = "ReactFlowContextMenu";
