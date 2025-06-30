import { Button, SubmitButton } from "@aventisia/ui/buttons";
import { useInputsOutputsForm } from "../hooks/useInputsOutputsForm";
import { Form } from "@aventisia/ui/form";
import { Plus } from "lucide-react";
import { InputsOutputsFieldsFormType } from "../constants/inputs-outputs-zod-schema";
import OutputFields from "./OutputFields";
import InputFields from "./InputFields";
import { useInputOutputsStore } from "../stores/inputs-outputs-store";
import { useShallow } from "zustand/react/shallow";
import { formDataToDCPJson } from "../utils/formdataToJson";
import { useUpdateInputOutput } from "../hooks/useUpdateInputOutput";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useViewport } from "@xyflow/react";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

const AddInputsOutputsForm = () => {
  const {
    form,
    inputFields,
    control,
    inputDefault,
    outputDefault,
    removeInput,
    appendInput,
    appendOutput,
    outputFields,
    removeOutput,
  } = useInputsOutputsForm();

  // Get global store state & actions
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  // Get ReactFlowExt store state & actions
  const { nodes, edges, setInputOutputObject } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      setInputOutputObject: state.setInputOutputObject,
    })),
  );

  const { setShowDialog } = useInputOutputsStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Get viewport state
  const viewportState = useViewport();

  const reactFlowObject = {
    nodes: nodes,
    edges: edges,
    viewport: viewportState,
  };

  const { mutate: updateInputOutput } = useUpdateInputOutput();

  const onSubmit = (formData: InputsOutputsFieldsFormType) => {
    const refinedData = formDataToDCPJson(formData);

    setInputOutputObject(refinedData);

    updateInputOutput({
      id: currentFlow.id,
      reactFlowObject: JSON.stringify(reactFlowObject),
      versionId: currentFlow.versionId,
      inputOutputObject: JSON.stringify(refinedData),
    });

    setShowDialog(false);
  };

  return (
    <>
      <Form
        methods={form}
        onSubmit={form.handleSubmit(onSubmit)}
        className="px-2.5 pb-5"
      >
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2>Inputs</h2>
            <Button
              variant="ghost"
              type="button"
              size="sm"
              onClick={() => appendInput(inputDefault)}
            >
              <Plus className="h-4 w-4" />
              Field
            </Button>
          </div>
          {inputFields.map((field, index) => (
            <InputFields
              field={field}
              control={control}
              index={index}
              remove={removeInput}
            />
          ))}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2>Outputs</h2>
            <Button
              variant="ghost"
              type="button"
              size="sm"
              onClick={() => appendOutput(outputDefault)}
            >
              <Plus className="h-4 w-4" />
              Field
            </Button>
          </div>
          {outputFields.map((field, index) => (
            <OutputFields
              field={field}
              control={control}
              index={index}
              remove={removeOutput}
            />
          ))}
        </div>
        {/* Submit button */}
        <div className="flex justify-end">
          <SubmitButton size={"sm"} isPending={false} primaryText="Save" />
        </div>
      </Form>
    </>
  );
};

export default AddInputsOutputsForm;
