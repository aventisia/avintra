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
  SimpleDDMenuItem,
} from "@aventisia/ui/dropdown-menu";
import { InputField } from "@aventisia/ui/form";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useRef } from "react";
import React from "react";
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { CategoryTableActionMenuTrigger } from "./CategoryTableMenuTrigger";
import SubSubCategoryList from "./SubSubCategoryList";

interface SubCategoryListProps {
  categoryNestIndex: number;
  form: UseFormReturn<z.infer<typeof inferenceModelFormZodSchema>>;
  registerAppendFn?: (fn: () => void) => void;
}

// ...rest of your imports

const SubCategoryList = ({
  categoryNestIndex,
  form,
  registerAppendFn,
}: SubCategoryListProps) => {
  const { control } = form;
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const subSubCategoryAppendFns = useRef<Record<number, () => void>>({});

  const {
    fields: subCategoryFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `classification.setupObject.categories.${categoryNestIndex}.subCategories`,
  });

  useEffect(() => {
    if (registerAppendFn) {
      registerAppendFn(() =>
        append({ name: "", instructions: "", subSubCategories: [] }),
      );
    }
  }, [append, registerAppendFn]);

  return (
    <div className="ml-6 space-y-2 border-l">
      {subCategoryFields.map((field, index) => (
        <React.Fragment key={field.id}>
          <div className="justify-left grid grid-cols-3 gap-2 px-2.5 py-1">
            <Controller
              control={control}
              name={`classification.setupObject.categories.${categoryNestIndex}.subCategories.${index}.name`}
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
              <Controller
                control={control}
                name={`classification.setupObject.categories.${categoryNestIndex}.subCategories.${index}.instructions`}
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

              {/* Dropdown with Add Sub-Sub-category */}
              <DropdownMenu>
                <CategoryTableActionMenuTrigger />
                <DropdownMenuContent
                  align="end"
                  className="mt-0 w-[20rem] min-w-[11rem] shadow-md"
                >
                  <SimpleDDMenuItem
                    size="md"
                    Icon={PlusIcon}
                    content="Add Sub-category"
                    onClick={() => {
                      subSubCategoryAppendFns.current[index]?.();
                    }}
                    className="cursor-pointer"
                  />
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

          {/* 👇 SubSubCategoryList Mounting Here */}
          <SubSubCategoryList
            categoryNestIndex={categoryNestIndex}
            subCategoryNestIndex={index}
            form={form}
            registerAppendFn={(fn) => {
              subSubCategoryAppendFns.current[index] = fn;
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

export default SubCategoryList;
