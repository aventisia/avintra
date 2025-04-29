// components/DataToBeExtractedSection.tsx
import { Controller, UseFormReturn } from "react-hook-form";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { Plus } from "lucide-react";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  fieldNameProps,
  instructionsProps,
  typeProps,
} from "../../constants/info-extractor-form-field-props";
import { z } from "zod";
import { addInfoExtractorFormZodSchema } from "../../constants/add-info-extractor-zod-schema";

type DataToBeExtractedProps = {
  form: UseFormReturn<z.infer<typeof addInfoExtractorFormZodSchema>>;
  dataFields: { id: string }[];
  addDataToExtracted: () => void;
  removeDataToExtracted: (index: number) => void;
};

const DataToBeExtracted = ({
  form,
  dataFields,
  addDataToExtracted,
  removeDataToExtracted,
}: DataToBeExtractedProps) => {
  const { control } = form;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-base">Fields</p>
        <Button
          type="button"
          variant="ghost"
          className="text-primary"
          onClick={addDataToExtracted}
        >
          <Plus size={20} />
        </Button>
      </div>
      <div className="!mt-0.5 inline-block rounded-lg border">
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] bg-accent text-center text-sm">
          <div className="border-b border-r px-2 py-2.5">Field Name</div>
          <div className="border-b border-r px-2 py-2.5">Type</div>
          <div className="border-b px-2 py-2.5">Instructions</div>
          <div className="border-b px-2 py-2.5"></div>
        </div>

        {dataFields.map((field, index) => (
          <div
            key={field.id}
            className={`grid grid-cols-[1fr_1fr_1fr_auto] justify-center gap-2 ${index !== dataFields.length - 1 && "border-b"} px-2 py-2.5`}
          >
            {/* Field Name */}
            <Controller
              control={control}
              name={`dataToBeExtracted.${index}.fieldName`}
              render={({ field }) => (
                <InputField
                  {...fieldNameProps}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />

            {/* Type */}
            <Controller
              control={control}
              name={`dataToBeExtracted.${index}.type`}
              render={({ field }) => (
                <SelectField
                  {...typeProps}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />

            {/* Instructions */}
            <Controller
              control={control}
              name={`dataToBeExtracted.${index}.instructions`}
              render={({ field }) => (
                <InputField
                  {...instructionsProps}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />

            {/* Delete button */}
            {dataFields.length > 1 && (
              <Button
                type="button"
                onClick={() => removeDataToExtracted(index)}
                className="m-0 p-0"
                variant="ghost"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataToBeExtracted;
