import { cn } from "@avplatform/ui/lib";
import { KeyboardEvent } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { NodeDataType } from "@/types/node-data-type";

import { useNodeSelectorStore } from "../stores/action-selector-store";
import { ActionToSelect } from "./ActionToSelect";

interface ActionsListProps {
  items: NodeDataType[] | undefined;
  nodeSelectionHandler: (item: NodeDataType) => void;
  rightRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  firstItemRef?: React.MutableRefObject<HTMLButtonElement | null>;
  rightIndex: number;
  handleRightPaneKeyDown: (e: KeyboardEvent, index: number, action: NodeDataType) => void;
  isFocusedPane: boolean;
}

const ActionsList = ({
  items,
  nodeSelectionHandler,
  rightRefs,
  firstItemRef,
  rightIndex,
  handleRightPaneKeyDown,
  isFocusedPane,
}: ActionsListProps) => {
  const { setShowDialog } = useNodeSelectorStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  const { isChatAgent } = useCurrentFlowStore(
    useShallow((state) => ({
      isChatAgent: state.isChatAgent,
    })),
  );

  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">No actions available.</div>
    );
  }

  return (
    <>
      {items.map((action, idx) => {
        if (action.hidden) return null;

        const isFocused = isFocusedPane && rightIndex === idx;
        const isDisabled =
          action.disabled ||
          (isChatAgent &&
            action.supportedPlatforms?.length === 1 &&
            action.supportedPlatforms?.includes("windows"));

        const isChatAiNode = action.name == "CreateConversationAIAgent";

        return (
          <button
            key={action.name}
            ref={(el) => {
              rightRefs.current[idx] = el;
              if (idx === 0 && firstItemRef) firstItemRef.current = el;
            }}
            role="option"
            aria-selected={isFocused}
            disabled={isDisabled || (isChatAiNode && !isChatAgent)}
            tabIndex={isFocused ? 0 : -1}
            onClick={() => {
              nodeSelectionHandler(action);
              setShowDialog(false);
            }}
            onKeyDown={(e) => handleRightPaneKeyDown(e, idx, action)}
            className={cn(
              "mb-1 w-full rounded-lg p-1 text-left outline-none transition-colors",
              isFocused
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
              (isDisabled || (isChatAiNode && !isChatAgent)) && "cursor-not-allowed opacity-50",
            )}
          >
            <ActionToSelect data={action} />
          </button>
        );
      })}
    </>
  );
};

export default ActionsList;
