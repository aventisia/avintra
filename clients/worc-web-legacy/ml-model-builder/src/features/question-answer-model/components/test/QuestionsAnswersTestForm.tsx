import { inferenceModelTestFormZodSchema } from "@/features/inferencing-model/constants/inference-model-test-zod-schema";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";

import QuestionAnswerFields from "./question-answer";

interface QuestionsAnswersTestFormProps {
  form: UseFormReturn<z.infer<typeof inferenceModelTestFormZodSchema>>;
}

const QuestionsAnswersTestForm = ({ form }: QuestionsAnswersTestFormProps) => {
  const { control } = form;
  const { fields: questionAnswerFields } = useFieldArray({
    control,
    name: "questionAnswer",
  });

  return (
    <div className="space-y-10 px-4 pb-1">
      <QuestionAnswerFields
        form={form}
        questionAnswerFields={questionAnswerFields}
      />
    </div>
  );
};

export default QuestionsAnswersTestForm;
