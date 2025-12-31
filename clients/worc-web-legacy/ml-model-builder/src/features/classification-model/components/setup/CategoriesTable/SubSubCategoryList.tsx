import {
  categoryNameProps,
  instructionsProps,
} from "@/features/classification-model/constants/classification-model-setup-form-field-props";
import { inferenceModelFormZodSchema } from "@/features/inferencing-model/constants/inference-model-zod-schema";

import { Separator } from "@aventisia/ui";
import {
  DeleteDDMenuItem,
  DropdownMenu,
  DropdownMenuContent,
} from "@aventisia/ui/dropdown-menu";
import { InputField } from "@aventisia/ui/form";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useEffect } from "react";
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { CategoryTableActionMenuTrigger } from "./CategoryTableMenuTrigger";

interface SubSubCategoryListProps {
  categoryNestIndex: number;
  subCategoryNestIndex: number;
  form: UseFormReturn<z.infer<typeof inferenceModelFormZodSchema>>;
  registerAppendFn?: (fn: () => void) => void;
}

const SubSubCategoryList = ({
  categoryNestIndex,
  subCategoryNestIndex,
  form,
  registerAppendFn,
}: SubSubCategoryListProps) => {
  const { control } = form;
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const {
    fields: subSubCategoryFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `classification.setupObject.categories.${categoryNestIndex}.subCategories.${subCategoryNestIndex}.subSubCategories`,
  });

  useEffect(() => {
    if (registerAppendFn) {
      registerAppendFn(() =>
        append({
          name: "",
          instructions: "",
        }),
      );
    }
  }, [append, registerAppendFn]);

  return (
    <div className="ml-6 mt-2 space-y-2 border-l pl-4">
      {subSubCategoryFields.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-3 gap-2 items-center pr-3"
        >
          {/* Sub-sub-category Name */}
          <Controller
            control={control}
            name={`classification.setupObject.categories.${categoryNestIndex}.subCategories.${subCategoryNestIndex}.subSubCategories.${index}.name`}
            render={({ field }) => (
              <InputField
                {...categoryNameProps}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
          />

          <div className="grid grid-cols-[1fr_auto] gap-1 col-span-2">
            {/* Instructions */}
            <Controller
              control={control}
              name={`classification.setupObject.categories.${categoryNestIndex}.subCategories.${subCategoryNestIndex}.subSubCategories.${index}.instructions`}
              render={({ field }) => (
                <InputField
                  {...instructionsProps}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  className="flex-grow"
                />
              )}
            />

            {/* Delete Button */}
            <DropdownMenu>
              <CategoryTableActionMenuTrigger />
              <DropdownMenuContent
                align="end"
                className="mt-0 w-[20rem] min-w-[11rem] shadow-md"
              >
                <Separator />
                <DeleteDDMenuItem
                  size="md"
                  content="Delete"
                  className="cursor-pointer"
                  onClick={() => {
                    showDefaultAlertDialog({
                      confirmActionFn: () => remove(index),
                      alertType: "delete-record",
                      additionalText: "sub-category",
                    });
                  }}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubSubCategoryList;
