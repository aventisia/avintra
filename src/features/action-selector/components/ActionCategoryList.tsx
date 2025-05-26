import { CommandItem, CommandList } from "@aventisia/ui/command";
import { actionSelectorData } from "../constants/action-selector-data";
import { useNodeSelectorStore } from "../stores/action-selector-store";
import { useShallow } from "zustand/react/shallow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@aventisia/ui/accordion";
import { Button } from "@aventisia/ui/buttons";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Separator } from "@aventisia/ui";
import { useAddFirstNodeToFlow } from "@/hooks/useAddFirstNodeToFlow";
import { useAddNodeFromEdge } from "@/hooks/useAddNodeFromEdge";
import { useAddFirstNodeToBranch } from "@/hooks/useAddFirstNodeToBranch";
import { useReplaceNode } from "@/hooks/useReplaceNode";
import { NodeDataType } from "@/types/node-data-type";
import ActionsList from "./ActionsList";
import { triggersList } from "../constants/trigger-data";
import { ActionCategoryType } from "../types/action-category-type";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

export const ActionCategoryList = () => {
  // Get the origin and originId from the store
  const { origin, originId, query } = useNodeSelectorStore(
    useShallow((state) => ({
      origin: state.origin,
      originId: state.originId,
      query: state.query,
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

  const { projectInfo } = useCurrentFlowStore(
    useShallow((state) => ({
      projectInfo: state.projectInfo,
    })),
  );

  const getActionCategories = () => {
    if (query) {
      const result: ActionCategoryType[] = [];
      actionSelectorData.forEach(({ name, actionCategories }) => {
        if (
          projectInfo?.type === "AutomationAgent" &&
          name === "aiIntegrations"
        )
          return;
        actionCategories.forEach((category) => {
          const matchingActions = category.actions
            ? category.actions?.filter((action) =>
                action.label.toLowerCase().includes(query.toLowerCase()),
              )
            : [];

          if (matchingActions.length > 0) {
            result.push({
              description: category.description,
              img: category.img,
              label: category.label,
              name: category.name,
              actions: matchingActions,
            });
          }
        });
      });

      return result;
    } else {
      return actionSelectorData.find(
        (item) => item.label === primaryCategoryLabel,
      )?.actionCategories;
    }
  };

  const actionCategories = getActionCategories();

  // Get add/replace Node handlers
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

  // Return the primary category list
  return (
    <CommandList>
      {isOriginReplaceTrigger ? (
        <>
          {/* TODO: better name for triggerList component */}
          <ActionsList
            item={triggersList}
            nodeSelectionHandler={nodeSelectionHandler}
          />
        </>
      ) : (
        <>
          {!query && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon8"
                className="min-w-[2rem]"
                onClick={() => {
                  setPrimaryCategoryLabel(null);
                }}
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
              <h2 className="ml-2 w-full truncate text-sm">
                {primaryCategoryLabel}
              </h2>
            </div>
          )}
          {actionCategories?.map((item, index) => (
            <>
              <CommandItem className="rounded-lg p-1 aria-selected:bg-transparent">
                {item.listType === "list" ? (
                  <ActionsList
                    item={item?.actions}
                    nodeSelectionHandler={nodeSelectionHandler}
                  />
                ) : (
                  <Accordion
                    value={query ? item.name : undefined}
                    type="single"
                    collapsible
                    className="w-full"
                  >
                    <AccordionItem value={item.name} className="border-none">
                      <AccordionTrigger className="px-1.5 py-2">
                        <div className="flex w-full gap-3 text-sm">
                          {item.label}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ActionsList
                          item={item?.actions}
                          nodeSelectionHandler={nodeSelectionHandler}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CommandItem>
              {/* Separator */}
              {index < actionSelectorData.length - 1 && (
                <div className="flex justify-center">
                  <Separator
                    orientation="horizontal"
                    className="h-[0.5px] w-[90%]"
                  />
                </div>
              )}
            </>
          ))}
        </>
      )}
    </CommandList>
  );
};
