import { inferenceModelFormZodSchema } from "@/features/inferencing-model/constants/inference-model-zod-schema";
import LLMConfiguration from "@/features/llm-configuration/components/LLMConfiguration";

import { InputField } from "@aventisia/ui/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import {
  totalMaxWordsProps,
  totalMinWordsProps,
} from "../../constants/summarization-model-setup-form-field-props";

interface SummarizationModelSetupFormProps {
  form: UseFormReturn<z.infer<typeof inferenceModelFormZodSchema>>;
}

const SummarizationModelSetupForm = ({
  form,
}: SummarizationModelSetupFormProps) => {
  return (
    <div className="space-y-4 w-full px-3 !py-1">
      <div className="grid grid-cols-2 gap-2">
        {/* Total Min Words */}
        <InputField {...totalMinWordsProps} />

        {/* Total Max Words */}
        <InputField {...totalMaxWordsProps} />
      </div>
      {/* LLM Configuration */}
      <LLMConfiguration form={form} modelType="summarization" />
    </div>
  );
};

export default SummarizationModelSetupForm;
