import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { getFlowToLoad } from "@/features/react-flow/apis/react-flow-apis";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import {
  FieldItemFormValues,
  InputsOutputsFieldsFormType,
  OutputFieldFormValues,
  inputsOutputsFieldsSchema,
} from "../constants/inputs-outputs-zod-schema";
import { DCPJsonToFormData } from "../utils/jsonToFormdata";

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

  // Get global store state & actions
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  const { control } = form;

  const { data, isLoading } = useQuery({
    queryFn: () => getFlowToLoad(currentFlow.id || "flowId", currentFlow.versionId),
    queryKey: ["flow", currentFlow.id, currentFlow.versionId],
    enabled: !!currentFlow.id,
  });

  useEffect(() => {
    if (data && Object.keys(JSON.parse(data?.data?.inputOutputObject || "{}")).length > 0) {
      form.reset(DCPJsonToFormData(JSON.parse(data.data.inputOutputObject || "")));
    }
  }, [data, form]);

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
    isLoading,
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
