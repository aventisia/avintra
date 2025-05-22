import { fieldValueProps } from "@/features/information-extractor/constants/info-extractor-test-form-field-props";
import { infoExtractorTestFormZodSchema } from "@/features/information-extractor/constants/info-extractor-test-zod-schema";
import { textColorClassMap } from "@/features/information-extractor/constants/text-color-class-map";

import { DotSeparator } from "@aventisia/ui";
import {
  FormControl,
  FormItem,
  FormLabel,
  InputField,
} from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

type FormSchema = z.infer<typeof infoExtractorTestFormZodSchema>;
type Field = FormSchema["fields"][number] & { id: string };

type DataFieldsProps = {
  form: UseFormReturn<z.infer<typeof infoExtractorTestFormZodSchema>>;
  dataFields: Field[];
};

const DataFields = ({ form, dataFields }: DataFieldsProps) => {
  const { control } = form;

  return (
    <div className="space-y-3">
      <p className="text-base">Fields</p>

      {dataFields.map((field, index) => {
        const fieldName = field.name;
        const dotColor = textColorClassMap[index % textColorClassMap.length];
        const accuracy = field.accuracy || 0;

        return (
          <FormItem key={field.id} className="space-y-0.5">
            <FormLabel className="flex items-center justify-between">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-0 ">
                  {fieldName}
                  <DotSeparator
                    className={cn(
                      "mx-0.5 -mt-5 text-[2.3rem] hidden",
                      dotColor,
                    )}
                  />
                </div>
                <div>
                  <span
                    className={
                      accuracy < 35
                        ? "text-destructive"
                        : accuracy > 70
                          ? "text-green-500"
                          : "text-yellow-500"
                    }
                  >
                    {field.accuracy ? field.accuracy : 0}%
                  </span>
                </div>
              </div>
            </FormLabel>
            <FormControl>
              <Controller
                control={control}
                name={`fields.${index}.value`}
                render={({ field }) => (
                  <InputField
                    {...fieldValueProps}
                    {...field}
                    placeholder={`Enter value for ${fieldName}`}
                  />
                )}
              />
            </FormControl>
          </FormItem>
        );
      })}
    </div>
  );
};

export default DataFields;
