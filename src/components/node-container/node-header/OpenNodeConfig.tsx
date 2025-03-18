/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActivityConfig,
  DynamicForm,
  getFormFields,
} from "@/features/dynamic-form";
import { dynamicActionMapper } from "@/features/dynamic-form/utils/utils";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import {
  Popover,
  PopoverContent,
  PopoverDefaultHeader,
  PopoverTrigger,
} from "@/react-toolkit/ui/popover";
import { StopPropagationWrapper } from "@/react-toolkit/ui/StopPropagationWrapper";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Node } from "@xyflow/react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import filterFieldValues from "../utils/filterFieldValues";

interface OpenNodeConfigProps {
  data: NodeDataType;
  id: string | undefined;
}

export const OpenNodeConfig = ({ data, id }: OpenNodeConfigProps) => {
  //State to handle current activityConfig form
  const [activityConfig, setActivityConfig] = useState<ActivityConfig | null>(
    null,
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  // Get ReactFlowExt store state & actions
  const { nodes, setNodes } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
    })),
  );

  // Function to update the node with the desired id
  function updateNodeFieldValues(
    targetId: string | undefined,
    newFieldValues: { [key: string]: any },
  ): Node[] {
    return nodes.map((node: Node) => {
      if (node.id === targetId) {
        // Add or update the fieldValues in the data property
        return {
          ...node,
          data: {
            ...node.data,
            inputs: filterFieldValues(newFieldValues, "input"),
            outputs: filterFieldValues(newFieldValues, "output"),
          },
        };
      }
      return node;
    });
  }

  // Handle form submission
  const formSubmitHandler = (formData: { [key: string]: any }) => {
    setNodes(updateNodeFieldValues(id, { ...formData }));
  };

  // Update the activityConfig for selected node
  useEffect(() => {
    setActivityConfig(dynamicActionMapper[data.name]);
  }, [data.name]);

  return (
    <StopPropagationWrapper className="flex">
      {activityConfig && (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon6" }),
              "group z-10",
              "aria-[expanded=true]:bg-accent",
              "nodrag nopan",
            )}
          >
            <Cog6ToothIcon
              className={cn(
                "h-3.5 w-3.5 stroke-[2.5] text-[--icon-color] opacity-50",
              )}
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            />
          </PopoverTrigger>
          {/* Popover content */}
          <PopoverContent
            collisionPadding={10}
            align="start"
            side="right"
            variant={"responsive"}
            className="max-h-fit min-w-[30vw]"
          >
            <PopoverDefaultHeader heading={data.label} />
            {activityConfig && (
              <DynamicForm
                className="flex h-full flex-col"
                formFieldCategories={getFormFields(
                  "insert",
                  activityConfig?.fieldList,
                  activityConfig?.fieldCategories,
                  [],
                )}
                formFieldsToWatch={activityConfig?.fieldsToWatch}
                onSubmit={formSubmitHandler}
                // formFieldValuesToFill={[...data.inputs, ...data.outputs]}
                formFieldValuesToFill={[
                  ...(data.inputs ?? []),
                  ...(data.outputs ?? []),
                ]}
                setIsPopoverOpen={setIsPopoverOpen}
              />
            )}
          </PopoverContent>
        </Popover>
      )}
    </StopPropagationWrapper>
  );
};
