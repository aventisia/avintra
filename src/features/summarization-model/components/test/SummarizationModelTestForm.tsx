import { inferenceModelTestFormZodSchema } from "@/features/inferencing-model/constants/inference-model-test-zod-schema";

import { AutosizeTextareaField } from "@aventisia/ui/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { summarizedTextProps } from "../../constants/summarization-model-test-form-field-props";

interface SummarizationModelTestFormProps {
  form: UseFormReturn<z.infer<typeof inferenceModelTestFormZodSchema>>;
}

const SummarizationModelTestForm = ({
  form,
}: SummarizationModelTestFormProps) => {
  const summarizedText = form.getValues("summarization.summary")?.trim();
  const summarizedTextLength = summarizedText
    ? summarizedText.split(/\s+/).length
    : 0;

  return (
    <div className="space-y-4 px-4 pb-1 ">
      <AutosizeTextareaField
        {...summarizedTextProps}
        label={`Summarized Text (${summarizedTextLength})`}
      />
    </div>
  );
};

export default SummarizationModelTestForm;
