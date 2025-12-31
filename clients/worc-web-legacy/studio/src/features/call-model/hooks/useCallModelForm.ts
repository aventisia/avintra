import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";
import {
  modelFormData,
  modelFormSchema,
} from "../constants/model-config-zod-schema";
import { convertToFormData } from "../utils/convertToFormData";
import { getModelSetup } from "../apis/search-model-apis";
import { transformModelResponse } from "@/features/dynamic-config-panel/utils/transform-model-setup";

export const useCallModelForm = () => {
  // Get node unique name state (required to get config panel data)
  const { nodeId, nodeData, setShowDialog } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      nodeId: state.nodeId,
      nodeData: state.nodeData,
      setShowDialog: state.setShowDialog,
    })),
  );
  // New state to hold the description
  const [aiModelResultDescription, setAiModelResultDescription] = useState("");

  const form = useForm<modelFormData>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      AIModelResult: {
        value: "AIModelResult",
        enabled: true,
      },
      ResponseCode: {
        value: "ResponseCode",
        enabled: true,
      },
    },
  });

  // Destructor form values and methods
  const { control, watch, setValue } = form;

  const watchModel = watch("MLModel") ?? nodeData?.selectedModel;

  useEffect(() => {
    if (watchModel) {
      setValue("llm", watchModel?.llMs?.toString() || "");
      if (watchModel?.id) {
        // API call to fetch setup based on model id
        getModelSetup(watchModel?.id)
          .then((response) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawModelSetup = response?.data as any;
            const transformed = transformModelResponse(
              rawModelSetup?.data?.data,
            );

            setAiModelResultDescription(transformed); // Now this is structured per model type
          })
          .catch(() => setAiModelResultDescription(""));
      } else {
        setAiModelResultDescription("");
      }
    }
  }, [nodeData, watchModel]);

  // Reset form values when nodeConfig or inputs/outputs change
  useEffect(() => {
    if (nodeData) {
      form.reset({
        ...convertToFormData(nodeData),
        MLModel: nodeData?.selectedModel,
      });
    }
  }, [nodeData]);

  return {
    form,
    control,
    setShowDialog,
    nodeId,
    aiModelResultDescription,
  };
};
