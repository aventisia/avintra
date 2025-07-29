import { inferenceModelTestFormZodSchema } from "@/features/inferencing-model/constants/inference-model-test-zod-schema";
import { answerProps } from "@/features/question-answer-model/constants/question-answer-test-form-field-props";
import { questionAnswerTestFormZodSchema } from "@/features/question-answer-model/constants/question-answer-test-form-zod-schema";

import {
  AutosizeTextareaField,
  FormControl,
  FormItem,
  FormLabel,
} from "@aventisia/ui/form";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

type FormSchema = z.infer<typeof questionAnswerTestFormZodSchema>;
type Field = FormSchema["questionAnswers"][number] & { id: string };

type DataFieldsProps = {
  form: UseFormReturn<z.infer<typeof inferenceModelTestFormZodSchema>>;
  questionAnswerFields: Field[];
};

const QuestionAnswerFields = ({
  form,
  questionAnswerFields,
}: DataFieldsProps) => {
  const { control } = form;

  return (
    <div className="space-y-4">
      {questionAnswerFields.map((field, index) => {
        const fieldName = field.question;

        return (
          <FormItem key={field.id} className="space-y-0.5">
            <FormLabel className="flex items-center justify-between">
              <p className="text-sm">
                {index + 1}. {fieldName}
              </p>
            </FormLabel>
            <FormControl>
              <Controller
                control={control}
                name={`questionAnswer.questionAnswers.${index}.answer`}
                render={({ field }) => (
                  <AutosizeTextareaField {...answerProps} {...field} />
                )}
              />
            </FormControl>
          </FormItem>
        );
      })}
    </div>
  );
};

export default QuestionAnswerFields;
