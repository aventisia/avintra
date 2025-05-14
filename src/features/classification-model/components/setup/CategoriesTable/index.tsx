import {
  categoryNameProps,
  instructionsProps,
} from "@/features/classification-model/constants/classification-model-setup-form-field-props";

import { Button } from "@aventisia/ui/buttons";
import { InputField } from "@aventisia/ui/form";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { classificationModelSetupFormZodSchema } from "../../../constants/classification-model-setup-zod-schema";

type CategoriesProps = {
  form: UseFormReturn<z.infer<typeof classificationModelSetupFormZodSchema>>;
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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
      <div className="!mt-0.5 inline-block rounded-lg border w-full">
        <div className="grid grid-cols-3 bg-accent px-1 py-3 text-sm">
          <div className="px-3">Category Name</div>
          <div className="px-3 col-span-2">Instructions</div>
        </div>

        {categoryFields.map((field, index) => (
          <div
            key={field.id}
            className={`justify-left grid grid-cols-3 gap-2 ${index !== categoryFields.length - 1 && "border-b"} p-2.5`}
          >
            {/* Category Name */}
            <Controller
              control={control}
              name={`categories.${index}.categoryName`}
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
                name={`categories.${index}.instructions`}
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

              {/* Delete button */}
              {categoryFields.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeCategory(index)}
                  className="m-0 p-0"
                  variant="ghost"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesTable;
