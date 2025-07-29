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
  return (
    <div className="space-y-4 px-4 pb-1 ">
      <AutosizeTextareaField
        {...summarizedTextProps}
        label={`Summarized Text (${
          form.getValues("summarization.summarizedText").trim() === ""
            ? 0
            : form.getValues("summarization.summarizedText").trim().split(/\s+/)
                .length
        })`}
      />
    </div>
  );
};

export default SummarizationModelTestForm;
