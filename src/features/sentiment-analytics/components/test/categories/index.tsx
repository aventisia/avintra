import { inferenceModelTestFormZodSchema } from "@/features/inferencing-model/constants/inference-model-test-zod-schema";
import { sentimentalAnalyticsTestFormZodSchema } from "@/features/sentiment-analytics/constants/sentiment-analytics-test-form-zod-schema";

import { CheckboxField, FormItem, FormLabel } from "@aventisia/ui/form";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import SubCategory from "./SubCategory";

type FormSchema = z.infer<typeof inferenceModelTestFormZodSchema>;
type SentimentAnalyticsSchema = z.infer<
  typeof sentimentalAnalyticsTestFormZodSchema
>;
type Field = SentimentAnalyticsSchema["categories"][number] & { id: string };

type DataFieldsProps = {
  form: UseFormReturn<FormSchema>;
  categoryFields: Field[];
};

const CategoryFields = ({ form, categoryFields }: DataFieldsProps) => {
  const { control } = form;

  return (
    <div className="space-y-4">
      <p className="text-base">Categories</p>

      <div className="grid gap-4">
        {categoryFields.map((field, index) => {
          const label = field.name;

          return (
            <div className="border py-3 rounded-lg space-y-4">
              <FormItem
                key={field.id}
                className="flex items-center gap-2  px-1.5"
              >
                <Controller
                  control={control}
                  name={`sentimentAnalytics.categories.${index}.value`}
                  render={({ field }) => (
                    <CheckboxField
                      name={field.name}
                      checked={field.value === "true"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "true" : "false")
                      }
                      label=""
                    />
                  )}
                />
                <FormLabel className="text-sm !mt-0">{label}</FormLabel>
              </FormItem>
              {field.subCategories && field.subCategories.length > 0 && (
                <SubCategory
                  form={form}
                  categoryIndex={index}
                  subCategories={field.subCategories}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFields;
