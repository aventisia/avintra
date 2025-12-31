import { fileinstructionsProps } from "@/features/ai-persona-model/constants/ai-persona-setup-form-field-props";
import { aiPersonaSetupFormZodSchema } from "@/features/ai-persona-model/constants/ai-persona-setup-zod-schema";
import { useToggleFileUploadDialogStore } from "@/features/ai-persona-model/store/toggle-file-uploader-store";

import { Button } from "@aventisia/ui/buttons";
import { AutosizeTextareaField } from "@aventisia/ui/form";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

type DocumentsTableProps = {
  form: UseFormReturn<z.infer<typeof aiPersonaSetupFormZodSchema>>;
  categoryFields: { id: string }[];
  addCategory: () => void;
  removeCategory: (id: string, index: number) => void;
};

const DocumentsTable = ({
  form,
  categoryFields,
  // addCategory,
  removeCategory,
}: DocumentsTableProps) => {
  const { control } = form;
  const { setShowFileUploadDialog } = useToggleFileUploadDialogStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-base">Add Documents</p>
        <Button
          variant="ghost"
          size="icon8"
          // onClick={addCategory}
          onClick={() => setShowFileUploadDialog(true)}
          type="button"
        >
          <PlusIcon className="h-5 w-5 stroke-2 text-primary" />
        </Button>
      </div>
      {categoryFields.length > 0 && (
        <div className="!mt-0.5 inline-block rounded-lg border w-full">
          <div className="grid grid-cols-2 bg-accent px-1 py-3 text-sm">
            <div className="px-3">File</div>
            <div className="px-3">Instructions</div>
          </div>

          {categoryFields.map((field, index) => (
            <div
              key={field.id}
              className={`justify-left grid grid-cols-2 items-center gap-10 ${index !== categoryFields.length - 1 && "border-b"} p-2.5`}
            >
              <div>
                <p className="text-sm whitespace-nowrap truncate">
                  {form.watch(
                    `aiPersona.setupObject.documents.${index}.name`,
                  ) || "Untitled Document"}
                </p>
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-1">
                {/* Instructions */}
                <Controller
                  control={control}
                  name={`aiPersona.setupObject.documents.${index}.instructions`}
                  render={({ field }) => (
                    <AutosizeTextareaField
                      {...fileinstructionsProps}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  )}
                />

                {/* Delete button */}
                <Button
                  type="button"
                  onClick={() =>
                    removeCategory(
                      form.getValues(
                        `aiPersona.setupObject.documents.${index}.id`,
                      ),
                      index,
                    )
                  }
                  className="m-0 p-0"
                  variant="ghost"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsTable;
