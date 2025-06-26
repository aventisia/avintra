import { Button, SubmitButton } from "@aventisia/ui/buttons";
import { useInputsOutputsForm } from "../hooks/useInputsOutputsForm";
import { Form } from "@aventisia/ui/form";
import { Plus } from "lucide-react";
import { InputsOutputsFieldsFormType } from "../constants/inputs-outputs-zod-schema";
import OutputFields from "./OutputFields";
import InputFields from "./InputFields";
import { useInputOutputsStore } from "../stores/inputs-outputs-store";
import { useShallow } from "zustand/react/shallow";
import { transformFormDataToDCPJson } from "../utils/formdataToJson";

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

  const { setShowDialog } = useInputOutputsStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );

  const onSubmit = (formData: InputsOutputsFieldsFormType) => {
    console.log(transformFormDataToDCPJson(formData));
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
