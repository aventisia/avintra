import { inferenceModelFormZodSchema } from "@/features/inferencing-model/constants/inference-model-zod-schema";
import LLMConfiguration from "@/features/llm-configuration/components/LLMConfiguration";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";

import CategoriesTable from "./CategoriesTable";

interface SentimentAnalyticsFormProps {
  form: UseFormReturn<z.infer<typeof inferenceModelFormZodSchema>>;
}
const SentimentAnalyticsForm = ({ form }: SentimentAnalyticsFormProps) => {
  const { control } = form;

  // useFieldArray for handling the dynamic array of categories
  const {
    fields: categoryFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "sentimentAnalytics.setupObject.categories",
  });

  // Function to add a new object to categories
  const addCategory = () => {
    append({ name: "", instructions: "", subCategories: [] });
  };

  // Function to remove an object from categories
  const removeCategory = (index: number) => {
    remove(index);
  };

  return (
    <div className="space-y-4 w-full px-3 !py-1">
      {/* Data to be extracted */}
      <CategoriesTable
        addCategory={addCategory}
        removeCategory={removeCategory}
        categoryFields={categoryFields}
        form={form}
      />

      <LLMConfiguration form={form} modelType="sentimentAnalytics" />
    </div>
  );
};

export default SentimentAnalyticsForm;
