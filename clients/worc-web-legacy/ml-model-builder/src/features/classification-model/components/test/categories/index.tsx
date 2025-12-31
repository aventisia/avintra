import { classificationModelTestFormZodSchema } from "@/features/classification-model/constants/classification-model-test-form-zod-schema";
import { inferenceModelTestFormZodSchema } from "@/features/inferencing-model/constants/inference-model-test-zod-schema";
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
type ClassificationSchema = z.infer<
  typeof classificationModelTestFormZodSchema
>;
type Field = ClassificationSchema[number] & { id: string };

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
          const hasChildren =
            field.subCategories && field.subCategories?.length > 0;

          return (
            <Collapsible key={field.id} defaultOpen className="relative group">
              <div className="flex items-center gap-2">
                {hasChildren && (
                  <>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant={"ghost"}
                        size={"icon8"}
                        className="!m-0 data-[state=closed]:rotate-[-90deg] w-auto h-auto bg-slate-200 !p-0.5 rounded-full"
                      >
                        <ChevronDown className="w-4 h-4 data-[state=closed]:rotate-[-90deg]" />
                      </Button>
                    </CollapsibleTrigger>
                  </>
                )}
                {hasChildren && (
                  <div className="h-full w-[2px] bg-slate-200 absolute left-[9.9px] top-[19px] group-data-[state=open]:block hidden"></div>
                )}

                <Controller
                  control={control}
                  name={`classification.${index}.value`}
                  render={({ field }) => (
                    <CheckboxField
                      name={field.name}
                      checked={field.value === "true"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "true" : "false")
                      }
                      // onCheckedChange={field.onChange}
                      label=""
                      className={!hasChildren ? "ml-[1.5px]" : ""}
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
