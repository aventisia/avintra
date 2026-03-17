import { iconMapper } from "@/components/icon-mapper";
import { useAddFirstNodeToBranch } from "@/hooks/useAddFirstNodeToBranch";
import { useAddFirstNodeToFlow } from "@/hooks/useAddFirstNodeToFlow";
import { useAddNodeFromEdge } from "@/hooks/useAddNodeFromEdge";
import { useReplaceNode } from "@/hooks/useReplaceNode";
import { NodeDataType } from "@/types/node-data-type";

import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { ArrowLeftIcon } from "lucide-react";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { triggersList } from "../constants/trigger-data";
import { useNodeSelectorStore } from "../stores/action-selector-store";
import { ActionCategoryType } from "../types/action-category-type";
import ActionsList from "./ActionsList";
import { FallbackImageIcon } from "./FallbackImageIcon";

interface ActionCategoryListProps {
  inputRef: React.RefObject<HTMLInputElement>;
  firstItemRef: React.MutableRefObject<HTMLButtonElement | null>;
}

export const ActionCategoryList = ({
  inputRef,
  firstItemRef,
}: ActionCategoryListProps) => {
  const {
    origin,
    originId,
    query,
    actionSelectorData,
    primaryCategoryLabel,
    setPrimaryCategoryLabel,
    setQuery,
    setShowDialog,
  } = useNodeSelectorStore(
    useShallow((state) => ({
      origin: state.origin,
      originId: state.originId,
      query: state.query,
      actionSelectorData: state.actionSelectorData,
      primaryCategoryLabel: state.primaryCategoryLabel,
      setPrimaryCategoryLabel: state.setPrimaryCategoryLabel,
      setQuery: state.setQuery,
      setShowDialog: state.setShowDialog,
    })),
  );

  const isOriginReplaceTrigger = origin === "ReplaceTrigger";

  const actionCategories = useMemo(() => {
    if (query) {
      const map = new Map<string, ActionCategoryType>();

      actionSelectorData.forEach((primary) => {
        primary.actionCategories.forEach((category) => {
          const matchingActions =
            category.actions?.filter((action) =>
              action.label.toLowerCase().includes(query.toLowerCase()),
            ) ?? [];

          if (matchingActions.length > 0) {
            map.set(category.label, { ...category, actions: matchingActions });
          }
        });
      });

      return Array.from(map.values());
    }
    return (
      actionSelectorData.find((item) => item.label === primaryCategoryLabel)
        ?.actionCategories || []
    );
  }, [query, actionSelectorData, primaryCategoryLabel]);

  const [activePane, setActivePane] = useState<"left" | "right">("left");
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);

  const leftRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rightRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const backButtonRef = useRef<HTMLButtonElement | null>(null);

  const activeCategory = actionCategories[leftIndex];
  const activeActions = activeCategory?.actions?.filter((a) => !a.hidden) || [];

  const addFirstNodeToFlow = useAddFirstNodeToFlow();
  const addNodeFromEdge = useAddNodeFromEdge();
  const addFirstNodeToBranch = useAddFirstNodeToBranch();
  const replaceNodeHandler = useReplaceNode();

  const handleSelectNode = (item: NodeDataType) => {
    setPrimaryCategoryLabel(null);
    switch (origin) {
      case "plusFirstNode":
        addFirstNodeToFlow(item, originId);
        break;
      case "PlusEdgeLabel":
        addNodeFromEdge(item, originId);
        break;
      case "plusNode":
        addFirstNodeToBranch(item, originId);
        break;
      case "ReplaceTrigger":
        replaceNodeHandler(item);
        break;
    }
  };

  useEffect(() => {
    setLeftIndex(0);
    setRightIndex(0);
    setActivePane(isOriginReplaceTrigger ? "right" : "left");
  }, [actionCategories.length, isOriginReplaceTrigger]);

  useEffect(() => {
    if (document.activeElement === inputRef.current) return;
    if (isOriginReplaceTrigger) {
      rightRefs.current[rightIndex]?.focus();
      return;
    }
    if (activePane === "left") leftRefs.current[leftIndex]?.focus();
    else rightRefs.current[rightIndex]?.focus();
  }, [activePane, leftIndex, rightIndex, isOriginReplaceTrigger, inputRef]);

  const handleBackKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      inputRef.current?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      leftRefs.current[0]?.focus();
      setLeftIndex(0);
      setActivePane("left");
    }
  };

  const handleLeftPaneKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setLeftIndex((prev) => Math.min(prev + 1, actionCategories.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index === 0) {
        if (!query && backButtonRef.current) {
          backButtonRef.current.focus();
        } else {
          inputRef.current?.focus();
        }
      } else {
        setLeftIndex((prev) => Math.max(prev - 1, 0));
      }
    } else if (e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      if (activeActions.length > 0) {
        setActivePane("right");
        setRightIndex(0);
      }
    }
  };

  const handleRightPaneKeyDown = (
    e: KeyboardEvent,
    index: number,
    action: NodeDataType,
  ) => {
    const listLength = isOriginReplaceTrigger
      ? triggersList.length
      : activeActions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setRightIndex((prev) => Math.min(prev + 1, listLength - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index === 0) {
        inputRef.current?.focus();
      } else {
        setRightIndex((prev) => Math.max(prev - 1, 0));
      }
    } else if (e.key === "ArrowLeft" && !isOriginReplaceTrigger) {
      e.preventDefault();
      setActivePane("left");
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!action.disabled) {
        handleSelectNode(action);
        setShowDialog(false);
      }
    }
  };

  if (isOriginReplaceTrigger) {
    return (
      <ScrollArea className="h-full p-2">
        <ActionsList
          items={triggersList}
          nodeSelectionHandler={handleSelectNode}
          rightRefs={rightRefs}
          firstItemRef={firstItemRef}
          rightIndex={rightIndex}
          handleRightPaneKeyDown={handleRightPaneKeyDown}
          isFocusedPane={true}
        />
      </ScrollArea>
    );
  }

  if (actionCategories.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No actions found.
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-[35%_65%] overflow-hidden">
      <div className="flex min-h-0 flex-col border-r bg-background">
        {!query && (
          <div className="flex shrink-0 items-center border-b p-2">
            <Button
              ref={(el) => {
                backButtonRef.current = el;
                if (el) firstItemRef.current = el;
              }}
              variant="ghost"
              size="icon8"
              onClick={() => {
                setPrimaryCategoryLabel(null);
                setQuery("");
                inputRef.current?.focus();
              }}
              onKeyDown={handleBackKeyDown}
              className="mr-2 outline-none focus-visible:bg-accent"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <h2 className="truncate text-sm font-medium">
              {primaryCategoryLabel}
            </h2>
          </div>
        )}

        <ScrollArea className="min-h-0 flex-1">
          <div
            className="space-y-1 p-2"
            role="tablist"
            aria-orientation="vertical"
          >
            {actionCategories.map((item, idx) => {
              const isActiveRow = leftIndex === idx;
              return (
                <button
                  key={item.label}
                  ref={(el) => {
                    leftRefs.current[idx] = el;
                    if (idx === 0 && query) firstItemRef.current = el;
                  }}
                  role="tab"
                  aria-selected={isActiveRow}
                  tabIndex={isActiveRow && activePane === "left" ? 0 : -1}
                  onClick={() => {
                    setLeftIndex(idx);
                    setActivePane("left");
                  }}
                  onKeyDown={(e) => handleLeftPaneKeyDown(e, idx)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors",
                    isActiveRow && "bg-muted font-medium text-foreground",
                    !isActiveRow && "text-foreground hover:bg-muted",
                  )}
                >
                  {item.icon
                    ? iconMapper[item.icon]
                    : item.img && (
                        <FallbackImageIcon className="h-5 w-5" src={item.img} />
                      )}
                  {item.label}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <ScrollArea
        className="min-h-0 bg-background"
        id="actions-panel"
        role="tabpanel"
      >
        <div className="p-2" role="listbox">
          <ActionsList
            items={activeActions}
            nodeSelectionHandler={handleSelectNode}
            rightRefs={rightRefs}
            rightIndex={rightIndex}
            handleRightPaneKeyDown={handleRightPaneKeyDown}
            isFocusedPane={activePane === "right"}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
