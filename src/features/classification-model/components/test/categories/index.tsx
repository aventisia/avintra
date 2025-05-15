import { accuracyValueProps } from "@/features/classification-model/constants/classification-model-test-form-field-props";
import { classificationModelTestFormZodSchema } from "@/features/classification-model/constants/classification-model-test-form-zod-schema";
import { SliderField } from "@/shared/Slider/SliderField";

import { FormItem, FormLabel, InputField } from "@aventisia/ui/form";
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

      {categoryFields.map((field, index) => {
        const label = field.fieldName;

        return (
          <FormItem>
            <FormLabel className="flex items-center justify-between text-sm">
              {label}
            </FormLabel>
            <Controller
              control={control}
              name={`categories.${index}.accuracy`}
              render={({ field }) => {
                return (
                  <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2">
                    <span className="text-sm">0%</span>
                    <SliderField
                      name={field.name}
                      value={[field.value ?? 0]}
                      onValueChange={(val) => field.onChange(val[0])}
                      onValueCommit={field.onBlur}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <span className="text-sm">100%</span>

                    <InputField {...field} {...accuracyValueProps} />
                  </div>
                );
              }}
            />
          </FormItem>
        );
      })}
    </div>
  );
};

export default CategoryFields;
