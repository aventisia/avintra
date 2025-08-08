import { classificationModelTestFormZodSchema } from "@/features/classification-model/constants/classification-model-test-form-zod-schema";
import { inferenceModelTestFormZodSchema } from "@/features/inferencing-model/constants/inference-model-test-zod-schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/collapsible/Collapsible";

import { Button } from "@aventisia/ui/buttons";
import { CheckboxField, FormItem, FormLabel } from "@aventisia/ui/form";
import { ChevronDown } from "lucide-react";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

type ClassificationSchema = z.infer<
  typeof classificationModelTestFormZodSchema
>;

type SubCategoryProps = {
  form: UseFormReturn<z.infer<typeof inferenceModelTestFormZodSchema>>;
  categoryIndex: number;
  subCategories: ClassificationSchema[number]["subCategories"];
};

const SubCategory = ({
  form,
  categoryIndex,
  subCategories,
}: SubCategoryProps) => {
  const { control } = form;

  return (
    <div className="ml-12 mt-2 space-y-0 grid gap-4">
      {subCategories?.map((subCat, subIndex) => {
        const hasChildren =
          subCat.subSubCategories && subCat.subSubCategories.length > 0;
        return (
          <Collapsible
            key={`${categoryIndex}-${subIndex}`}
            defaultOpen
            className="relative group"
          >
            <div className="flex items-center gap-2">
              {hasChildren && (
                <CollapsibleTrigger asChild>
                  <Button
                    variant={"ghost"}
                    size={"icon8"}
                    className="!m-0 data-[state=closed]:rotate-[-90deg] w-auto h-auto !p-0.5 rounded-full bg-slate-200"
                  >
                    <ChevronDown className="w-4 h-4 data-[state=closed]:rotate-[-90deg]" />
                  </Button>
                </CollapsibleTrigger>
              )}

              {hasChildren && (
                <div className="h-full w-[2px] bg-slate-200 absolute left-[9.9px] top-[19px] group-data-[state=open]:block hidden"></div>
              )}

              <Controller
                control={control}
                name={`classification.${categoryIndex}.subCategories.${subIndex}.value`}
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
              <FormLabel className="text-sm !mt-0">{subCat.name}</FormLabel>
            </div>

            <CollapsibleContent>
              {subCat.subSubCategories &&
                subCat.subSubCategories.length > 0 && (
                  <div className="ml-12 space-y-2 mt-2">
                    {subCat.subSubCategories.map((subSubCat, subSubIndex) => (
                      <FormItem
                        key={`${categoryIndex}-${subIndex}-${subSubIndex}`}
                        className="flex items-center gap-2"
                      >
                        <Controller
                          control={control}
                          name={`classification.${categoryIndex}.subCategories.${subIndex}.subSubCategories.${subSubIndex}.value`}
                          render={({ field }) => (
                            <CheckboxField
                              name={field.name}
                              checked={field.value === "true"}
                              onCheckedChange={(checked) =>
                                field.onChange(checked ? "true" : "false")
                              }
                              // onCheckedChange={field.onChange}
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
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default SubCategory;
