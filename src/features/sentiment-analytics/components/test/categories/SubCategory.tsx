import { inferenceModelTestFormZodSchema } from "@/features/inferencing-model/constants/inference-model-test-zod-schema";
import { sentimentalAnalyticsTestFormZodSchema } from "@/features/sentiment-analytics/constants/sentiment-analytics-test-form-zod-schema";

import { CheckboxField, FormItem, FormLabel } from "@aventisia/ui/form";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

type SentimentAnalyticsSchema = z.infer<
  typeof sentimentalAnalyticsTestFormZodSchema
>;

type SubCategoryProps = {
  form: UseFormReturn<z.infer<typeof inferenceModelTestFormZodSchema>>;
  categoryIndex: number;
  subCategories: SentimentAnalyticsSchema["categories"][number]["subCategories"];
};

const SubCategory = ({
  form,
  categoryIndex,
  subCategories,
}: SubCategoryProps) => {
  const { control } = form;

  return (
    <div className="ml-5 mt-1 space-y-0 grid gap-4">
      {subCategories?.map((subCat, subIndex) => (
        <div
          key={`${categoryIndex}-${subIndex}`}
          className="space-y-4 border-l pl-1"
        >
          <FormItem className="flex items-center gap-2">
            <Controller
              control={control}
              name={`sentimentAnalytics.categories.${categoryIndex}.subCategories.${subIndex}.value`}
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
            <FormLabel className="text-sm !mt-0">{subCat.name}</FormLabel>
          </FormItem>

          {/* If subSubCategories exist, render those too */}
          {subCat.subSubCategories && subCat.subSubCategories.length > 0 && (
            <div className="ml-5 mt-1 border-l pl-1">
              {subCat.subSubCategories.map((subSubCat, subSubIndex) => (
                <FormItem
                  key={`${categoryIndex}-${subIndex}-${subSubIndex}`}
                  className="flex items-center gap-2"
                >
                  <Controller
                    control={control}
                    name={`sentimentAnalytics.categories.${categoryIndex}.subCategories.${subIndex}.subSubCategories.${subSubIndex}.value`}
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
                  <FormLabel className="text-sm !mt-0">
                    {subSubCat.name}
                  </FormLabel>
                </FormItem>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SubCategory;
