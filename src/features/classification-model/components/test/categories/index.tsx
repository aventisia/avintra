import { classificationModelTestFormZodSchema } from "@/features/classification-model/constants/classification-model-test-form-zod-schema";

import { CheckboxField, FormItem, FormLabel } from "@aventisia/ui/form";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

type FormSchema = z.infer<typeof classificationModelTestFormZodSchema>;
type Field = FormSchema["categories"][number] & { id: string };

type DataFieldsProps = {
  form: UseFormReturn<FormSchema>;
  categoryFields: Field[];
};

const CategoryFields = ({ form, categoryFields }: DataFieldsProps) => {
  const { control } = form;

  return (
    <div className="space-y-4">
      <p className="text-base">Categories</p>

      <div className="grid grid-cols-2 gap-4">
        {categoryFields.map((field, index) => {
          const label = field.name;

          return (
            <FormItem
              key={field.id}
              className="flex items-center gap-2 border rounded-lg px-1.5 py-2"
            >
              <Controller
                control={control}
                name={`categories.${index}.checked`}
                render={({ field }) => (
                  <CheckboxField
                    name={field.name}
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    label=""
                  />
                )}
              />
              <FormLabel className="text-sm !mt-0">{label}</FormLabel>
            </FormItem>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFields;
