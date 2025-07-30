import { inferenceModelTestFormZodSchema } from "@/features/inferencing-model/constants/inference-model-test-zod-schema";
import { sentimentalAnalyticsTestFormZodSchema } from "@/features/sentiment-analytics/constants/sentiment-analytics-test-form-zod-schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/collapsible/Collapsible";

import { Button } from "@aventisia/ui/buttons";
import { CheckboxField, FormLabel } from "@aventisia/ui/form";
import { ChevronDown } from "lucide-react";
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
            <Collapsible key={field.id} defaultOpen>
              <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                  <Button
                    variant={"ghost"}
                    size={"icon8"}
                    className="!m-0 data-[state=closed]:rotate-[-90deg] w-auto h-auto bg-slate-200 !p-0.5 rounded-full"
                  >
                    <ChevronDown className="w-4 h-4 data-[state=closed]:rotate-[-90deg]" />
                  </Button>
                </CollapsibleTrigger>
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
              </div>
              <CollapsibleContent>
                {field.subCategories && field.subCategories.length > 0 && (
                  <SubCategory
                    form={form}
                    categoryIndex={index}
                    subCategories={field.subCategories}
                  />
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFields;
