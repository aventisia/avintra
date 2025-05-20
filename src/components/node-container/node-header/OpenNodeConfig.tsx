/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActivityConfig,
  DynamicForm,
  getFormFields,
} from "@/features/dynamic-form";
import { dynamicActionMapper } from "@/features/dynamic-form/utils/utils";
import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
// import {
//   Popover,
//   PopoverContent,
//   PopoverDefaultHeader,
//   PopoverTrigger,
// } from "@/react-toolkit/ui/popover";
import { StopPropagationWrapper } from "@/react-toolkit/ui/StopPropagationWrapper";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Node } from "@xyflow/react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import filterFieldValues from "../utils/filterFieldValues";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import { customActionMapper } from "@/features/custom-form/utils/utils";
import CustomForm from "@/features/custom-form/CustomForm";
import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
  DialogTrigger,
} from "@/react-toolkit/ui/dialog";

interface OpenNodeConfigProps {
  data: NodeDataType;
  id: string | undefined;
}

export const OpenNodeConfig = ({ data, id }: OpenNodeConfigProps) => {
  //State to handle current activityConfig form
  const [activityConfig, setActivityConfig] = useState<ActivityConfig | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Get ReactFlowExt store state & actions
  const { nodes, setNodes, setFlowVariablesObject, flowVariablesObject } =
    useReactFlowExtStore(
      useShallow((state) => ({
        nodes: state.nodes,
        setNodes: state.setNodes,
        setFlowVariablesObject: state.setFlowVariablesObject,
        flowVariablesObject: state.flowVariablesObject,
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

  function updateFlowVariablesObject(newFieldValues: {
    nodeId: string;
    [key: string]: any;
  }): FlowVariablesObjectType[] {
    const switchRegex = /^o_.*switch.*$/i;

    // Filter and map field values in one step, excluding keys matching the regex
    const filteredValues = filterFieldValues(newFieldValues, "output")
      .filter((item) => !switchRegex.test(item.key))
      .map((item) => item.value as string);

    const finalFlowVariablesObject = [...flowVariablesObject];

    // Check if the node already exists and update it, otherwise add a new entry
    const existingNode = finalFlowVariablesObject.find(
      (item) => item.nodeId === newFieldValues.nodeId,
    );

    if (existingNode) {
      existingNode.outputs = filteredValues;
    } else {
      finalFlowVariablesObject.push({
        nodeId: newFieldValues.nodeId,
        outputs: filteredValues,
      });
    }

    return finalFlowVariablesObject; // Return a new array to avoid mutating the original object
  }

  // Handle form submission
  const formSubmitHandler = (formData: { [key: string]: any }) => {
    setNodes(updateNodeFieldValues(id, { ...formData }));
    setFlowVariablesObject(
      updateFlowVariablesObject({ nodeId: id as string, ...formData }),
    );
    setIsDialogOpen(false);
  };

  // Close the dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  // Update the activityConfig for selected node
  useEffect(() => {
    setActivityConfig(
      dynamicActionMapper[data.name] || (customActionMapper[data.name] && true),
    );
  }, [data.name]);

  return (
    <StopPropagationWrapper className="flex">
      {activityConfig && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
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
            />
          </DialogTrigger>
          {/* Popover content */}
          <DialogContent side="right" className="min-w-[34rem] overflow-y-auto">
            <DialogDefaultHeader heading={data.label} />
            {(data.formType === undefined || data.formType === "dynamic") &&
            activityConfig ? (
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
                formFieldValuesToFill={[
                  ...(data.inputs ?? []),
                  ...(data.outputs ?? []),
                ]}
                closeDialog={closeDialog}
              />
            ) : (
              <CustomForm
                closeDialog={closeDialog}
                nodeId={id}
                name={data.name}
                formFieldValuesToFill={[
                  ...(data.inputs ?? []),
                  ...(data.outputs ?? []),
                ]}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </StopPropagationWrapper>
  );
};
