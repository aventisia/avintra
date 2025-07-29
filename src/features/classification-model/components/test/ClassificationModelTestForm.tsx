import { inferenceModelTestFormZodSchema } from "@/features/inferencing-model/constants/inference-model-test-zod-schema";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";

import CategoryFields from "./categories";

interface ClassificationModelTestFormProps {
  form: UseFormReturn<z.infer<typeof inferenceModelTestFormZodSchema>>;
}

const ClassificationModelTestForm = ({
  form,
}: ClassificationModelTestFormProps) => {
  const { control } = form;
  const { fields: categoryFields } = useFieldArray({
    control,
    name: "classification.categories",
  });

  return (
    <>
      <div className="space-y-10 px-4 pb-1">
        <CategoryFields form={form} categoryFields={categoryFields} />
      </div>
    </>
  );
};

export default ClassificationModelTestForm;
