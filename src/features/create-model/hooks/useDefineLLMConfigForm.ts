import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { llmConfigZodSchema } from "../constants/llm-config-zod-schema";
import { useEffect } from "react";
import {
  useDynamicConfigPanelStore,
  useUpdateNodeDataIO,
} from "@/features/dynamic-config-panel";
import { useShallow } from "zustand/react/shallow";

export const useDefineLLMConfigForm = () => {
  const { nodeId, nodeData, setShowDialog } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      nodeData: state.nodeData,
      nodeId: state.nodeId,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof llmConfigZodSchema>>({
    resolver: zodResolver(llmConfigZodSchema),
    defaultValues: {
      input: "",
      is_byok_enabled: false,
      credential_id: "",
      provider: "",
      model: "",
      temperature: 0.2,
      top_p: 0,
      AIModelResult: { value: "AIModelResult", enabled: true },
    },
  });

  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // Get handlers to update node inputs and outputs
  const { updateNodeDataIO, updateFlowVariablesObject } = useUpdateNodeDataIO();

  // Function to convert an array of key-value input/output objects back into a form object
  const convertToFormData = (
    keyValueArray: { key: string; value: unknown }[],
  ): FieldValues => {
    return keyValueArray.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as FieldValues);
  };

  // Function to convert form data into an array of key-value objects for inputs
  const convertToKeyValueArray = (
    formData: FieldValues,
  ): { key: string; value: unknown }[] => {
    return Object.keys(formData)
      .map((key) => ({
        key,
        value: formData[key],
      }))
      .filter((v) => v.key !== "AIModelResult"); // execute output
  };

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof llmConfigZodSchema>) => {
    const inputs = convertToKeyValueArray(formData);

    const outputs = [
      {
        key: "AIModelResult",
        value: {
          value: formData.AIModelResult.value,
          enabled: formData.AIModelResult.enabled,
        },
      },
    ];

    if (nodeId) {
      updateNodeDataIO(nodeId, inputs, outputs);
      updateFlowVariablesObject(nodeId, [
        {
          key: "AIModelResult",
          value: {
            value: formData.AIModelResult.value,
            enabled: formData.AIModelResult.enabled,
          },
        },
      ]);
    }

    // Close the dialog
    setShowDialog(false);
  };

  useEffect(() => {
    form.reset({
      is_byok_enabled: false,
      model: "gpt-4o-mini",
      provider: "openai",
      temperature: 1,
      top_p: 1,
    });
    if (nodeData?.inputs && nodeData?.outputs) {
      form.reset({
        ...convertToFormData(nodeData?.inputs),
        ...convertToFormData(nodeData?.outputs),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeData?.inputs]);

  // Return form and methods
  return {
    form,
    isSubmitting,
    isDirty,
    onSubmit,
  };
};
