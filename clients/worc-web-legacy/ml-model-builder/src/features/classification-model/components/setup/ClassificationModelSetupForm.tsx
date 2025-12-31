import { inferenceModelFormZodSchema } from "@/features/inferencing-model/constants/inference-model-zod-schema";
import LLMConfiguration from "@/features/llm-configuration/components/LLMConfiguration";

import { Separator } from "@aventisia/ui";
import { SwitchField } from "@aventisia/ui/form";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { allowMultipleClassesProps } from "../../constants/classification-model-setup-form-field-props";
import CategoriesTable from "./CategoriesTable";

interface ClassificationModelSetupFormProps {
  form: UseFormReturn<z.infer<typeof inferenceModelFormZodSchema>>;
}

const ClassificationModelSetupForm = ({
  form,
}: ClassificationModelSetupFormProps) => {
  const { control } = form;

  const {
    fields: categoryFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "classification.setupObject.categories",
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

      {/* Separator */}
      <Separator />

      <div className="bg-slate-50">
        <SwitchField {...allowMultipleClassesProps} />
      </div>

      <LLMConfiguration form={form} modelType="classification" />
    </div>
  );
};

export default ClassificationModelSetupForm;
