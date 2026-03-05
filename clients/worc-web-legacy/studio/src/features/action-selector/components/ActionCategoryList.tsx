import { useAddFirstNodeToBranch } from "@/hooks/useAddFirstNodeToBranch";
import { useAddFirstNodeToFlow } from "@/hooks/useAddFirstNodeToFlow";
import { useAddNodeFromEdge } from "@/hooks/useAddNodeFromEdge";
import { useReplaceNode } from "@/hooks/useReplaceNode";
import { NodeDataType } from "@/types/node-data-type";
import { useShallow } from "zustand/react/shallow";
import { triggersList } from "../constants/trigger-data";
import { useNodeSelectorStore } from "../stores/action-selector-store";
import { ActionCategoryType } from "../types/action-category-type";
import ActionsList from "./ActionsList";
import { iconMapper } from "@/components/icon-mapper";
import { FallbackImageIcon } from "./FallbackImageIcon";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@aventisia/ui/buttons";
import { ArrowLeftIcon } from "lucide-react";
import { ScrollArea } from "@aventisia/ui/scroll";
import { cn } from "@aventisia/ui/lib";

export const ActionCategoryList = () => {
  // Get the origin and originId from the store
  const { origin, originId, query, actionSelectorData } = useNodeSelectorStore(
    useShallow((state) => ({
      origin: state.origin,
      originId: state.originId,
      query: state.query,
      actionSelectorData: state.actionSelectorData,
    })),
  );

  // Get primaryCategory function from the store
  const { primaryCategoryLabel, setPrimaryCategoryLabel } =
    useNodeSelectorStore(
      useShallow((state) => ({
        primaryCategoryLabel: state.primaryCategoryLabel,
        setPrimaryCategoryLabel: state.setPrimaryCategoryLabel,
      })),
    );

  // Is used to render the list of triggers
  const isOriginReplaceTrigger = origin === "ReplaceTrigger";

  const [activeCategoryLabel, setActiveCategoryLabel] = useState<string | null>(
    null,
  );

  // SEARCH LOGIC FIXED
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
            map.set(category.label, {
              ...category,
              actions: matchingActions,
            });
          }
        });
      });

      return Array.from(map.values());
    }

    return actionSelectorData.find(
      (item) => item.label === primaryCategoryLabel,
    )?.actionCategories;
  }, [query, actionSelectorData, primaryCategoryLabel]);

  // Auto select first
  useEffect(() => {
    if (actionCategories?.length) {
      setActiveCategoryLabel(actionCategories[0].label);
    } else {
      setActiveCategoryLabel(null);
    }
  }, [actionCategories]);

  const addFirstNodeToFlow = useAddFirstNodeToFlow();
  const addNodeFromEdge = useAddNodeFromEdge();
  const addFirstNodeToBranch = useAddFirstNodeToBranch();
  const replaceNodeHandler = useReplaceNode();

  // Handle the node selection
  const nodeSelectionHandler = (item: NodeDataType) => {
    // Set the primary category label to null
    setPrimaryCategoryLabel(null);

    // Switch based on the origin
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

  if (isOriginReplaceTrigger) {
    return (
      <div className="h-full overflow-auto p-2">
        <ActionsList
          item={triggersList}
          nodeSelectionHandler={nodeSelectionHandler}
        />
      </div>
    );
  }

  if (actionCategories && actionCategories?.length > 0) {
    return (
      <div className="grid h-full grid-cols-[35%_65%] overflow-hidden">
        {/* LEFT COLUMN */}
        <div className="flex min-h-0 flex-col border-r">
          {/* Fixed Header */}
          {!query && (
            <div className="flex shrink-0 items-center border-b p-2">
              <Button
                variant="ghost"
                size="icon8"
                onClick={() => setPrimaryCategoryLabel(null)}
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
              <h2 className="ml-2 truncate text-sm">{primaryCategoryLabel}</h2>
            </div>
          )}

          {/* Scrollable List */}
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-1 p-2">
              {actionCategories?.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveCategoryLabel(item.label)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm",
                    activeCategoryLabel === item.label
                      ? "bg-muted font-medium"
                      : "hover:bg-muted/50",
                  )}
                >
                  {item.icon
                    ? iconMapper[item.icon]
                    : item.img && (
                        <FallbackImageIcon className="h-5 w-5" src={item.img} />
                      )}
                  {item.label}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT COLUMN */}
        <ScrollArea className="min-h-0">
          <div className="p-2">
            {activeCategoryLabel ? (
              <ActionsList
                item={
                  actionCategories?.find((c) => c.label === activeCategoryLabel)
                    ?.actions
                }
                nodeSelectionHandler={nodeSelectionHandler}
              />
            ) : null}
          </div>
        </ScrollArea>
      </div>
    );
  } else return <></>;
};
