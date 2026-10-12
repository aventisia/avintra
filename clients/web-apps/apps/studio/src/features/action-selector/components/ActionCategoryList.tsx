import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ArrowLeftIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { iconMapper } from "@/components/icon-mapper";
import { useUsableToolCatalog } from "@/features/dynamic-config-panel/hooks/useTools.hook";
import { useAddFirstNodeToBranch } from "@/hooks/useAddFirstNodeToBranch";
import { useAddFirstNodeToFlow } from "@/hooks/useAddFirstNodeToFlow";
import { useAddNodeFromEdge } from "@/hooks/useAddNodeFromEdge";
import { useReplaceNode } from "@/hooks/useReplaceNode";
import { NodeDataType } from "@/types/node-data-type";

import { CUSTOM_TOOLS_L1_LABEL } from "../constants/custom-tools";
import { triggersList } from "../constants/trigger-data";
import { useAddCustomTool } from "../hooks/useAddCustomTool.hook";
import { useNodeSelectorStore } from "../stores/action-selector-store";
import { ActionCategoryType } from "../types/action-category-type";
import {
  convertToolOperationsToActions,
  getActiveCustomTools,
  getToolName,
} from "../utils/custom-tools-converter";
import ActionsList from "./ActionsList";
import { CustomToolIcon } from "./CustomToolIcon";
import { FallbackImageIcon } from "./FallbackImageIcon";

interface ActionCategoryListProps {
  inputRef: React.RefObject<HTMLInputElement>;
  firstItemRef: React.MutableRefObject<HTMLButtonElement | null>;
}

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

  const { data: catalogResponse, isLoading: isCatalogLoading } = useUsableToolCatalog();
  const customTools = useMemo(
    () => getActiveCustomTools(catalogResponse?.data).sort((a, b) => a.name.localeCompare(b.name)),
    [catalogResponse],
  );

  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const selectedTool = useMemo(
    () => customTools.find((tool) => tool.id === selectedToolId) ?? customTools[0] ?? null,
    [customTools, selectedToolId],
  );

  const customToolActions = useMemo(
    () =>
      selectedTool ? convertToolOperationsToActions(selectedTool, selectedTool.operations) : [],
    [selectedTool],
  );

  const { addCustomTool: handleAddCustomTool } = useAddCustomTool();

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

  // IMPORTANT NOTE: this block must stay before the "No actions found" early-return because the
  // custom-tools directory is sourced live from useUsableToolCatalog instead of static actions.
  if (isCustomToolsSection) {
    return (
      <div className="grid h-full grid-cols-[35%_65%] overflow-hidden">
        {/* L2 — back header + custom tools directory (left pane) */}
        <div className="flex min-h-0 flex-col border-r bg-background">
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
            <h2 className="truncate text-sm font-medium">{primaryCategoryLabel}</h2>
            <Tooltip content="Add custom tool">
              <Button
                onClick={handleAddCustomTool}
                className="ml-auto rounded-full"
                size="icon8"
                variant="ghost"
                aria-label="Add custom tool"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>

          {isCatalogLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2Icon
                className="h-4 w-4 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          ) : customTools.length === 0 ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
              <p className="text-sm font-medium">Create your first custom tool</p>
              <p className="text-sm text-muted-foreground">
                Custom tools let your agents call your own APIs. Click “+” to open the tool builder.
              </p>
            </div>
          ) : (
            <ScrollArea className="min-h-0 flex-1">
              <div className="p-2" role="listbox" aria-label="Custom tools">
                {customTools.map((tool) => {
                  const isSelected = tool.id === selectedTool?.id;
                  return (
                    <button
                      key={tool.id}
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={0}
                      onClick={() => setSelectedToolId(tool.id)}
                      className={cn(
                        "mb-1 flex w-full items-start gap-3 rounded-lg p-2 text-left outline-none transition-colors",
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <CustomToolIcon icon={tool.icon} iconUrl={tool.iconUrl} className="mt-0.5" />
                      <div className="grow overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <h3 className="truncate text-xs font-medium text-foreground">
                            {getToolName(tool)}
                          </h3>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* L3 — fills the right pane from below the search bar to the bottom */}
        <div className="flex min-h-0 flex-col overflow-hidden bg-background">
          {selectedTool ? (
            customToolActions.length === 0 ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
                <p className="text-sm font-medium">No actions found</p>
                <p className="text-sm text-muted-foreground">
                  This tool’s OpenAPI spec exposes no endpoints yet.
                </p>
              </div>
            ) : (
              <ScrollArea className="min-h-0 flex-1" role="tabpanel">
                <div className="p-2" role="listbox" aria-label="Custom tool actions">
                  <ActionsList
                    items={customToolActions}
                    nodeSelectionHandler={handleSelectNode}
                    rightRefs={rightRefs}
                    rightIndex={rightIndex}
                    handleRightPaneKeyDown={handleRightPaneKeyDown}
                    isFocusedPane={false}
                  />
                </div>
              </ScrollArea>
            )
          ) : (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
              <p className="text-sm font-medium">Select a tool</p>
              <p className="text-sm text-muted-foreground">
                Choose a custom tool on the left to see its available actions.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (actionCategories.length === 0) {
    return <div className="p-4 text-center text-sm text-muted-foreground">No actions found.</div>;
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
            <h2 className="truncate text-sm font-medium">{primaryCategoryLabel}</h2>
          </div>
        )}

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-1 p-2" role="tablist" aria-orientation="vertical">
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
                    "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors",
                    isActiveRow && "bg-muted font-medium text-foreground",
                    !isActiveRow && "text-foreground hover:bg-muted",
                  )}
                >
                  {item.icon
                    ? iconMapper[item.icon]
                    : item.img && <FallbackImageIcon className="h-5 w-5" src={item.img} />}
                  {item.label}
                  {import.meta.env.MODE !== "production" && hasCorsairAction && (
                    <Badge
                      variant="outline"
                      className="bg-muted text-3xs font-medium text-muted-foreground "
                    >
                      Corsair
                    </Badge>
                  )}
                  {import.meta.env.MODE !== "production" && hasCamelAction && (
                    <Badge
                      variant="outline"
                      className="bg-muted text-3xs font-medium text-muted-foreground "
                    >
                      Camel
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <ScrollArea className="min-h-0 bg-background" id="actions-panel" role="tabpanel">
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
