import { accuracyValueProps } from "@/features/sentiment-analytics/constants/sentiment-analytics-test-form-field-props";
import { sentimentalAnalyticsTestFormZodSchema } from "@/features/sentiment-analytics/constants/sentiment-analytics-test-form-zod-schema";
import { sliderColorClassMap } from "@/features/sentiment-analytics/constants/slider-color-class-map";

import { FormItem, FormLabel, InputField } from "@aventisia/ui/form";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { SliderField } from "../../Slider/SliderField";

type FormSchema = z.infer<typeof sentimentalAnalyticsTestFormZodSchema>;
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
        const colorIndex = index % sliderColorClassMap.length;

        return (
          <FormItem>
            <FormLabel className="flex items-center justify-between text-sm">
              {label}
            </FormLabel>
            <Controller
              control={control}
              name={`categories.${index}.accuracy`}
              render={({ field }) => {
                console.log("FV", field.value);

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
                      thumbColorClass={`border-${sliderColorClassMap[colorIndex].dark}`}
                      rangeColorClass={`bg-${sliderColorClassMap[colorIndex].dark}`}
                      trackColorClass={sliderColorClassMap[colorIndex].light}
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
