import { InferenceModelSetupDTO } from "@/features/inferencing-model/dtos/inference-model-setup-dto";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { useQueryClient } from "@tanstack/react-query";
import { SparklesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { saveAsTemplateSchema } from "../constants/save-as-template-zod-schema";
import { useGenerateInstructionMutation } from "../hooks/useGenerateInstructionMutation";
import { cleanInferenceModelSetup } from "../utils/cleanInferenceModelSetup";

const GenerateButton = ({
  setVal,
}: {
  setVal: UseFormSetValue<z.infer<typeof saveAsTemplateSchema>>;
}) => {
  const queryClient = useQueryClient();

  const [promptData, setPromptData] = useState<string>("");

  const { modelName, versionId } = useLabelDataStore(
    useShallow((state) => ({
      modelName: state.modelName,
      versionId: state.versionId,
    })),
  );

  // Mutation hook to generate the template instruction
  const { mutate, data, isPending } = useGenerateInstructionMutation();

  useEffect(() => {
    // Get Setup Form Data
    const data = queryClient.getQueryData<{
      data: InferenceModelSetupDTO;
    }>(["INFERENCE_SETUP_FORM_DATA", versionId]);

    if (data?.data) {
      setPromptData(cleanInferenceModelSetup(data.data));
    }
  }, [queryClient, versionId]);

  // Update the form value 'instruction' whenever new data is returned from the mutation
  useEffect(() => {
    if (data?.data) {
      setVal("instruction", data.data);
    }
  }, [data?.data]);

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "flex items-center gap-2 border-primary text-primary transition-all duration-200 hover:bg-primary hover:text-white",
        isPending && "cursor-wait",
      )}
      type="button"
      disabled={isPending}
      onClick={() => {
        // Trigger mutation with serialized prompt data extracted from nodes
        mutate({
          refType: "AIModel",
          refId: versionId,
          refName: modelName,
          payload: promptData,
        });
      }}
    >
      {/* Icon with pulse animation while generating */}
      <SparklesIcon className={cn("h-4 w-4", isPending && "animate-pulse")} />

      {/* Button text changes based on mutation state */}
      {isPending ? "Generating..." : "Generate"}
    </Button>
  );
};

export default GenerateButton;
