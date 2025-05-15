import { answerProps } from "@/features/question-answer-model/constants/question-answer-test-form-field-props";
import { questionAnswerTestFormZodSchema } from "@/features/question-answer-model/constants/question-answer-test-form-zod-schema";

import {
  FormControl,
  FormItem,
  FormLabel,
  TextareaField,
} from "@aventisia/ui/form";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

type FormSchema = z.infer<typeof questionAnswerTestFormZodSchema>;
type Field = FormSchema["questionAnswers"][number] & { id: string };

type DataFieldsProps = {
  form: UseFormReturn<z.infer<typeof questionAnswerTestFormZodSchema>>;
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
        const accuracy = field.accuracy || 0;

        return (
          <FormItem key={field.id} className="space-y-0.5">
            <FormLabel className="flex items-center justify-between">
              <div className="flex justify-between items-center w-full">
                <div>{fieldName}</div>
                <div>
                  <span
                    className={
                      accuracy < 35
                        ? "text-destructive"
                        : accuracy > 70
                          ? "text-green-500"
                          : "text-yellow-500"
                    }
                  >
                    {field.accuracy}%
                  </span>
                </div>
              </div>
            </FormLabel>
            <FormControl>
              <Controller
                control={control}
                name={`questionAnswers.${index}.answer`}
                render={({ field }) => (
                  <TextareaField
                    {...answerProps}
                    {...field}
                    placeholder={`Enter value for ${fieldName}`}
                  />
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
