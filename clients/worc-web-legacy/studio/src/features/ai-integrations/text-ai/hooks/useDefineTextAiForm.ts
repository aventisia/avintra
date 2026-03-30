import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import {
  TextAiFormData,
  textAiFormSchema,
} from "../constants/text-ai-config-zod-schema";

export const useDefineTextAiForm = () => {
  // Get node unique name state (required to get config panel data)
  const { nodeId, nodeData, setShowDialog } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      nodeId: state.nodeId,
      nodeData: state.nodeData,
      setShowDialog: state.setShowDialog,
    })),
  );
  console.log(nodeData);
  const form = useForm<TextAiFormData>({
    resolver: zodResolver(textAiFormSchema),
    defaultValues: {
      __Prompt__TextAi: "",
      __ModelConfig__TextAi: {
        is_byok_enabled: false,
        provider: "openai",
        model: "gpt-4o-mini",
        temperature: 1,
        top_p: 1,
        is_json_output: true,
        max_output_tokens: null,
      },
      Files: "",
      __KbConfig__TextAi: {
        knowledgeBase: "",
        retrievalType: "Basic",
        sourceThreshold: 1,
        numberOfChunks: 10,
      },
      __MemoryConfig__TextAi: {
        memoryProvider: "Memory Provider 1",
        maxDataStored: 4,
      },
      toolChoiceStrategy: "auto",
      useJSONSchema: false,
      SchemaName: "",
      json_schema: "",
      Result: {
        value: "Result",
        enabled: true,
      },
    },
  });

  const { control } = form;

  // const useJSONSchema = watch("useJSONSchema");

  // // Reset form values when nodeConfig or inputs/outputs change
  // useEffect(() => {
  //   if (nodeData) {
  //     form.reset({
  //       ...convertToFormData(nodeData),
  //     });
  //   }
  // }, [nodeData]);

  return {
    form,
    control,
    setShowDialog,
    nodeId,
  };
};
