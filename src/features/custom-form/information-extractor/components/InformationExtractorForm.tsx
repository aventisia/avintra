/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAddInformationExtractorForm } from "../hooks/useAddInfoExtractorForm";
import { Form } from "@/react-toolkit/ui/form/Form";
import {
  documentContextProps,
  inputTextProps,
  modelNameProps,
  nodePropmptProps,
  saveInModelLibraryProps,
} from "../constants/info-extractor-form-field-props";
import { TextareaField } from "@/react-toolkit/ui/form/fields/TextareaField";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Separator } from "@/react-toolkit/ui/separator";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { CheckboxField } from "@/react-toolkit/ui/form/fields/CheckboxField";
import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import DataToBeExtracted from "./DataToBeExtracted";
import ContextTables from "./ContextTable";
import { FormProvider } from "react-hook-form";
import AddModel from "./AddModel/AddModel";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useShallow } from "zustand/react/shallow";
import { Node } from "@xyflow/react";
import filterFieldValues from "@/components/node-container/utils/filterFieldValues";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
interface InformationExtractorFormProps {
  /** A function to close the dialog. */
  closeDialog: () => void;

  /** Form fields values mainly getting as response from an api and to fill the form to view or update data */
  formFieldValuesToFill?: any;

  /** Id of node that we are working with currently */
  nodeId: string | undefined;
}

const InformationExtractorForm = ({
  closeDialog,
  formFieldValuesToFill,
  nodeId,
}: InformationExtractorFormProps) => {
  const {
    form,
    isSubmitting,
    dataFields,
    addDataToExtracted,
    removeDataToExtracted,
    tableFields,
    addTableHandler,
    removeTableHandler,
    addTableHeaderHandler,
    removeTableHeaderHandler,
  } = useAddInformationExtractorForm({ formFieldValuesToFill });

  const { getValues } = form;

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

  // Submit handler
  function submitHandler(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setNodes(updateNodeFieldValues(nodeId, { ...getValues() }));
    setFlowVariablesObject(
      updateFlowVariablesObject({ nodeId: nodeId as string, ...getValues() }),
    );
    closeDialog();
  }

  return (
    <Form
      methods={form}
      // onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <ScrollArea className="mt-4 flex-grow px-2 py-1 pb-4">
        <FormProvider {...form}>
          <div className="space-y-4 px-2 py-1">
            {/* Document Context */}
            <TextareaField {...documentContextProps} />

            {/* Input Text */}
            <TextareaField {...inputTextProps} />

            {/* Separator */}
            <Separator />

            {/* Data to be extracted */}
            <DataToBeExtracted
              addDataToExtracted={addDataToExtracted}
              dataFields={dataFields}
              form={form}
              removeDataToExtracted={removeDataToExtracted}
            />

            {/* Separator */}
            <Separator />

            {/* Context Table */}
            <ContextTables
              addTableHandler={addTableHandler}
              addTableHeaderHandler={addTableHeaderHandler}
              removeTableHeaderHandler={removeTableHeaderHandler}
              form={form}
              removeTableHandler={removeTableHandler}
              tableFields={tableFields}
            />

            <Separator />

            {/* Node Prompt */}
            <TextareaField {...nodePropmptProps} />

            {/* Add Model Fucntionality */}
            <AddModel form={form} />

            {/* Save in model library */}
            <CheckboxField {...saveInModelLibraryProps} />

            {/* Model Name */}
            <InputField {...modelNameProps} />
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
          onClick={submitHandler}
        />
      </div>
    </Form>
  );
};

export default InformationExtractorForm;
