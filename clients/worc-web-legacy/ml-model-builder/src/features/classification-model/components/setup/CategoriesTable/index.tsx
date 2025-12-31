import {
  categoryNameProps,
  instructionsProps,
} from "@/features/classification-model/constants/classification-model-setup-form-field-props";
import { inferenceModelFormZodSchema } from "@/features/inferencing-model/constants/inference-model-zod-schema";

import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  DeleteDDMenuItem,
  DropdownMenu,
  DropdownMenuContent,
  SimpleDDMenuItem,
} from "@aventisia/ui/dropdown-menu";
import { InputField } from "@aventisia/ui/form";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { PlusIcon } from "@heroicons/react/24/outline";
import React, { useRef } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { CategoryTableActionMenuTrigger } from "./CategoryTableMenuTrigger";
import SubCategoryList from "./SubCategoryList";

type CategoriesProps = {
  form: UseFormReturn<z.infer<typeof inferenceModelFormZodSchema>>;
  categoryFields: { id: string }[];
  addCategory: () => void;
  removeCategory: (index: number) => void;
};

const CategoriesTable = ({
  form,
  categoryFields,
  addCategory,
  removeCategory,
}: CategoriesProps) => {
  const { control } = form;
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const subCategoryAppendFns = useRef<Record<number, () => void>>({});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-base">Categories</p>
        <Button
          variant="ghost"
          size="icon8"
          onClick={addCategory}
          type="button"
        >
          <PlusIcon className="h-5 w-5 stroke-2 text-primary" />
        </Button>
      </div>
      <div className="!mt-0.5 inline-block rounded-lg border w-full bg-slate-50">
        <div className="grid grid-cols-3 px-1 py-3 text-sm rounded-lg border-b">
          <div className="px-3">Category Name</div>
          <div className="px-3 col-span-2">Instructions</div>
        </div>

        {categoryFields.map((field, index) => (
          <React.Fragment key={field.id}>
            <div className={`justify-left grid grid-cols-3 gap-2  p-2.5`}>
              {/* Category Name */}
              <Controller
                control={control}
                name={`classification.setupObject.categories.${index}.name`}
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
                  name={`classification.setupObject.categories.${index}.instructions`}
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

                {/* Delete & Add button */}
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
                        subCategoryAppendFns.current[index]?.();
                      }}
                      className="cursor-pointer"
                    />
                    {categoryFields.length > 1 && (
                      <>
                        <Separator />
                        <DeleteDDMenuItem
                          size="md"
                          content="Delete"
                          className="cursor-pointer"
                          onClick={() => {
                            showDefaultAlertDialog({
                              confirmActionFn: () => removeCategory(index),
                              alertType: "delete-record",
                              additionalText: "categroy",
                            });
                          }}
                        />
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <SubCategoryList
              categoryNestIndex={index}
              form={form}
              registerAppendFn={(fn) => {
                subCategoryAppendFns.current[index] = fn;
              }}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CategoriesTable;
