import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import {
  InputsOutputsFieldsFormType,
  inputsOutputsFieldsSchema,
  FieldItemFormValues,
  OutputFieldFormValues,
} from "../constants/inputs-outputs-zod-schema";

/**
 * Custom hook for defining a form.
 */
export const useInputsOutputsForm = () => {
  const inputDefault: FieldItemFormValues = {
    direction: "Input",
    name: "",
    label: "",
    defaultValue: "",
    type: "text",
    required: false,
  };

  const outputDefault: OutputFieldFormValues = {
    direction: "Output",
    name: "",
    label: "",
    defaultValue: "",
    type: "config-panel-output",
  };

  // Define form with zod schema
  const form = useForm<InputsOutputsFieldsFormType>({
    resolver: zodResolver(inputsOutputsFieldsSchema),
    defaultValues: {
      inputs: [inputDefault],
      outputs: [outputDefault],
    },
  });

  const { control } = form;

  const {
    fields: inputFields,
    append: appendInput,
    remove: removeInput,
  } = useFieldArray({
    control,
    name: "inputs",
  });

  const {
    fields: outputFields,
    append: appendOutput,
    remove: removeOutput,
  } = useFieldArray({
    control,
    name: "outputs",
  });

  return {
    form,
    control,
    inputFields,
    appendInput,
    removeInput,
    outputFields,
    appendOutput,
    removeOutput,
    inputDefault,
    outputDefault,
  };
};
