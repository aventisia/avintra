/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form } from "@/react-toolkit/ui/form/Form";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { FormProvider } from "react-hook-form";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import {
  valueProps,
  variableProps,
} from "../constants/set-variable-form-field-props";
import { Separator } from "@/react-toolkit/ui/separator";
import { Button } from "@aventisia/ui/buttons";
import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
import { TextareaField } from "@/react-toolkit/ui/form/fields/TextareaField";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useShallow } from "zustand/react/shallow";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import filterFieldValues from "@/components/node-container/utils/filterFieldValues";
import { Node } from "@xyflow/react";
import { useSetVariableForm } from "../hooks/useSetVariableForm";

interface SetVariableFormProps {
  /** A function to close the dialog. */
  closeDialog: () => void;

  /** Form fields values mainly getting as response from an api and to fill the form to view or update data */
  formFieldValuesToFill?: any;

  /** Id of node that we are working with currently */
  nodeId: string | undefined;
}

const SetVariableForm = ({
  closeDialog,
  formFieldValuesToFill,
  nodeId,
}: SetVariableFormProps) => {
  const { form, isSubmitting } = useSetVariableForm({ formFieldValuesToFill });

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
    // Filter and map field values in one step, excluding keys matching the regex
    const filteredValues = [newFieldValues.variable];

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

  // Submit handler
  function submitHandler(formData: any) {
    setNodes(updateNodeFieldValues(nodeId, { ...formData }));
    setFlowVariablesObject(
      updateFlowVariablesObject({ nodeId: nodeId as string, ...formData }),
    );
    closeDialog();
  }

  return (
    <Form
      methods={form}
      disabled={isSubmitting}
      onSubmit={form.handleSubmit(submitHandler)}
    >
      <ScrollArea className="mt-4 flex-grow px-2 py-1 pb-4">
        <FormProvider {...form}>
          <div className="space-y-4 px-2 py-1">
            {/* Variable Name Props */}
            <InputField {...variableProps} />

            {/* Value Props */}
            <TextareaField {...valueProps} />
          </div>
        </FormProvider>
      </ScrollArea>

      <Separator className="my-0 h-[0.5px] w-full" />
      <div className="flex items-center justify-end gap-2 px-4 py-1 pb-4">
        <Button onClick={closeDialog} variant="outline" size="xs" type="button">
          Cancel
        </Button>
        <SubmitButton
          size="xs"
          isPending={isSubmitting}
          primaryText="Save"
          // onClick={submitHandler}
        />
      </div>
    </Form>
  );
};

export default SetVariableForm;
