import { inferenceModelFormZodSchema } from "@/features/inferencing-model/constants/inference-model-zod-schema";
import LLMConfiguration from "@/features/llm-configuration/components/LLMConfiguration";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";

import QuestionAnswerTable from "./QuestionAnswerTable";

interface QuestionAnswerSetupFormProps {
  form: UseFormReturn<z.infer<typeof inferenceModelFormZodSchema>>;
}

const QuestionAnswerSetupForm = ({ form }: QuestionAnswerSetupFormProps) => {
  const { control } = form;

  const {
    fields: categoryFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "questionAnswer.setupObject.questionAnswers",
  });

  // Function to add a new object to categories
  const addQuestion = () => {
    append({ name: "", instructions: "" });
  };

  // Function to remove an object from categories
  const removeQuestion = (index: number) => {
    remove(index);
  };

  return (
    <div className="space-y-4 w-full px-3 !py-1">
      {/* Data to be extracted */}
      <QuestionAnswerTable
        addCategory={addQuestion}
        removeCategory={removeQuestion}
        categoryFields={categoryFields}
        form={form}
      />

      <LLMConfiguration form={form} modelType="questionAnswer" />
    </div>
  );
};

export default QuestionAnswerSetupForm;
