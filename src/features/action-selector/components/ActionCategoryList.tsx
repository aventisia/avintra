import { useAddFirstNodeToBranch } from "@/hooks/useAddFirstNodeToBranch";
import { useAddFirstNodeToFlow } from "@/hooks/useAddFirstNodeToFlow";
import { useAddNodeFromEdge } from "@/hooks/useAddNodeFromEdge";
import { useReplaceNode } from "@/hooks/useReplaceNode";
import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { NodeDataType } from "@/types/node-data-type";
import { Separator } from "@aventisia/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@aventisia/ui/accordion";
import { Button } from "@aventisia/ui/buttons";
import { CommandItem, CommandList } from "@aventisia/ui/command";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";
import { triggersList } from "../constants/trigger-data";
import { useNodeSelectorStore } from "../stores/action-selector-store";
import { ActionCategoryType } from "../types/action-category-type";
import ActionsList from "./ActionsList";
import { iconMapper } from "@/components/icon-mapper";
import { FallbackImageIcon } from "./FallbackImageIcon";

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

  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  const getActionCategories = () => {
    if (query) {
      const result: ActionCategoryType[] = [];
      actionSelectorData.forEach(({ label, actionCategories }) => {
        if (
          currentFlow?.type === FlowTypesEnum.AutomationAgent &&
          label === "AI Integrations"
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
                  <div className="w-full">
                    <ActionsList
                      item={item?.actions}
                      nodeSelectionHandler={nodeSelectionHandler}
                    />
                  </div>
                ) : (
                  <Accordion
                    value={query ? item.label : undefined}
                    type="single"
                    collapsible
                    className="w-full"
                  >
                    <AccordionItem value={item.label} className="border-none">
                      <AccordionTrigger className="px-1.5 py-2">
                        <div className="flex w-full items-center gap-3 text-sm">
                          {item.icon ? (
                            <div>{iconMapper[item.icon]}</div>
                          ) : item.img ? (
                            <FallbackImageIcon
                              className="h-5 w-5 "
                              src={item.img}
                            />
                          ) : null}

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
              {index < actionCategories.length - 1 && (
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
