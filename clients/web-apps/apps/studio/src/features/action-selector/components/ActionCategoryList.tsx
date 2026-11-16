import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { ArrowLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { iconMapper } from "@/components/icon-mapper";
import { useAddFirstNodeToBranch } from "@/hooks/useAddFirstNodeToBranch";
import { useAddFirstNodeToFlow } from "@/hooks/useAddFirstNodeToFlow";
import { useAddNodeFromEdge } from "@/hooks/useAddNodeFromEdge";
import { useReplaceNode } from "@/hooks/useReplaceNode";
import { NodeDataType } from "@/types/node-data-type";

import { CUSTOM_TOOLS_L1_LABEL } from "../constants/custom-tools.constant";
import { triggersList } from "../constants/trigger-data";
import { useNodeSelectorStore } from "../stores/action-selector-store";
import { ActionCategoryType } from "../types/action-category-type";
import { countActions } from "../utils/count-actions.util";
import ActionsList from "./ActionsList";
import { CustomToolsPane } from "./CustomToolsPane";
import { FallbackImageIcon } from "./FallbackImageIcon";
import { HighlightMatch } from "./HighlightMatch";
import { NoActionsMessage } from "./NoActionsMessage";

type ActionCategoryListProps = {
  inputRef: React.RefObject<HTMLInputElement>;
  firstItemRef: React.MutableRefObject<HTMLButtonElement | null>;
};

export const ActionCategoryList = ({ inputRef, firstItemRef }: ActionCategoryListProps) => {
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

  const isCustomToolsSection = !query && primaryCategoryLabel === CUSTOM_TOOLS_L1_LABEL;

  const actionCategories = useMemo(() => {
    if (query) {
      const normalizedQuery = query.toLowerCase();
      const map = new Map<string, ActionCategoryType>();

      actionSelectorData.forEach((primary) => {
        primary.actionCategories.forEach((category) => {
          const categoryMatches = category.label.toLowerCase().includes(normalizedQuery);

          const matchingActions = categoryMatches
            ? (category.actions ?? [])
            : (category.actions?.filter((action) =>
                action.label.toLowerCase().includes(normalizedQuery),
              ) ?? []);

          if (matchingActions.length > 0) {
            map.set(category.label, { ...category, actions: matchingActions });
          }
        });
      });

      return Array.from(map.values());
    }
    return (
      actionSelectorData.find((item) => item.label === primaryCategoryLabel)?.actionCategories || []
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

  const setBackButtonRef = (el: HTMLButtonElement | null) => {
    backButtonRef.current = el;
    if (el) firstItemRef.current = el;
  };

  const handleBack = () => {
    setPrimaryCategoryLabel(null);
    setQuery("");
    inputRef.current?.focus();
  };

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

  const handleRightPaneKeyDown = (e: KeyboardEvent, index: number, action: NodeDataType) => {
    const listLength = isOriginReplaceTrigger ? triggersList.length : activeActions.length;

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
      <ScrollArea
        viewportClassName="[&>div]:!block"
        className="h-full border-t border-line px-2 py-2"
      >
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

  if (isCustomToolsSection) {
    return (
      <CustomToolsPane
        title={primaryCategoryLabel}
        backButtonRef={setBackButtonRef}
        onBack={handleBack}
        onBackKeyDown={handleBackKeyDown}
        onSelectNode={handleSelectNode}
        rightRefs={rightRefs}
        rightIndex={rightIndex}
        onRightPaneKeyDown={handleRightPaneKeyDown}
      />
    );
  }

  if (actionCategories.length === 0) {
    return <NoActionsMessage />;
  }

  const totalActions = countActions(
    actionSelectorData.flatMap((primary) => primary.actionCategories),
  );
  const matchingActions = countActions(actionCategories);

  return (
    <div className="flex h-full flex-col border-t border-line">
      {!query && (
        <div className="flex h-11 shrink-0 items-center gap-1.5 border-b border-line pl-2 pr-4">
          <Button
            ref={setBackButtonRef}
            variant="ghost"
            size="icon7"
            onClick={handleBack}
            onKeyDown={handleBackKeyDown}
            aria-label="Go back"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
            <button
              type="button"
              tabIndex={-1}
              onClick={handleBack}
              className="shrink-0 text-muted-foreground transition-colors hover:text-ink"
            >
              All categories
            </button>
            <CaretRightIcon aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
            <h2 className="truncate font-semibold text-ink">{primaryCategoryLabel}</h2>
          </nav>
          <span className="ml-auto shrink-0 font-mono text-[11.5px] tabular-nums text-muted-foreground">
            {matchingActions} nodes
          </span>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,38%)_minmax(0,1fr)] overflow-hidden">
        <ScrollArea
          viewportClassName="[&>div]:!block"
          className="min-h-0 border-r border-line bg-sunken/60"
        >
          <div
            className="grid grid-cols-[minmax(0,1fr)] gap-0.5 p-2"
            role="tablist"
            aria-orientation="vertical"
          >
            {actionCategories.map((item, idx) => {
              const isActiveRow = leftIndex === idx;
              const hasCorsairAction = item.actions?.some((action) =>
                action.name?.includes("Corsair"),
              );
              const hasCamelAction = item.actions?.some((action) => action.name?.includes("Camel"));
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
                    "flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] outline-none transition-colors focus-visible:shadow-focus [&_img]:size-4 [&_svg]:size-4 [&_svg]:shrink-0",
                    isActiveRow
                      ? "bg-surface font-semibold text-ink shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-line [&_svg]:text-primary-text"
                      : "font-medium text-ink-2 hover:bg-hover hover:text-ink [&_svg]:text-muted-foreground",
                  )}
                >
                  {item.icon
                    ? iconMapper[item.icon]
                    : item.img && <FallbackImageIcon className="h-4 w-4" src={item.img} />}
                  <span className="min-w-0 truncate">
                    <HighlightMatch text={item.label} query={query} />
                  </span>
                  {import.meta.env.MODE !== "production" && hasCorsairAction && (
                    <Badge variant="outline">Corsair</Badge>
                  )}
                  {import.meta.env.MODE !== "production" && hasCamelAction && (
                    <Badge variant="outline">Camel</Badge>
                  )}
                  <span
                    className={cn(
                      "ml-auto font-mono text-[11px] font-normal tabular-nums",
                      isActiveRow ? "text-primary-text" : "text-muted-foreground",
                    )}
                  >
                    {countActions([item])}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex min-h-0 flex-col bg-surface">
          {activeCategory && (
            <div className="flex shrink-0 items-baseline gap-2 px-4 pb-1.5 pt-3">
              <h3 className="truncate text-[13.5px] font-semibold text-ink">
                {activeCategory.label}
              </h3>
              <span className="shrink-0 text-[12px] text-muted-foreground">
                {activeActions.length} {activeActions.length === 1 ? "action" : "actions"}
              </span>
            </div>
          )}
          <ScrollArea
            viewportClassName="[&>div]:!block"
            className="min-h-0 flex-1"
            id="actions-panel"
            role="tabpanel"
          >
            <div className="grid grid-cols-[minmax(0,1fr)] gap-0.5 px-2 pb-3" role="listbox">
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
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t border-line bg-sunken/60 py-2 pl-4 pr-3 text-[12px] text-muted-foreground">
        {query ? (
          <span className="mr-auto">
            <span className="font-medium text-ink-2">{matchingActions}</span> of {totalActions}{" "}
            actions match
          </span>
        ) : (
          <span className="mr-auto">Pick an action to add it as the next step</span>
        )}
        <span className="flex items-center gap-1">
          <Key>↑</Key>
          <Key>↓</Key>
          <span className="ml-0.5">move</span>
        </span>
        <span className="flex items-center gap-1">
          <Key>↵</Key>
          <span className="ml-0.5">add</span>
        </span>
      </div>
    </div>
  );
};

const Key = ({ children }: { children: string }) => (
  <kbd className="grid h-[18px] min-w-[18px] place-items-center rounded border border-line bg-surface px-1 font-mono text-[11px] font-medium leading-none text-ink-2 shadow-[0_1px_0_var(--line)]">
    {children}
  </kbd>
);
