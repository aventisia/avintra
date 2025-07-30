/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { useToggleFileUploadDialogStore } from "../../store/toggle-file-upload-store";

type DocumentsTableProps = {
  form: UseFormReturn<z.infer<any>>;
  categoryFields: { id: string }[];
  addCategory: () => void;
  removeCategory: (id: string, index: number) => void;
  name: string;
  label: string;
};

const DocumentsTable = ({
  form,
  categoryFields,
  removeCategory,
  name,
  label,
}: DocumentsTableProps) => {
  const { setShowFileUploadDialog } = useToggleFileUploadDialogStore();

  return (
    <div className="space-y-4 rounded-lg border">
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 bg-muted",
          categoryFields.length > 0 ? "rounded-t-lg" : "rounded-lg",
        )}
      >
        <p className="text-md">{label || "Documents"}</p>
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
        <div className="!mt-0.5 inline-block rounded-lg w-full py-4 px-2 space-y-2">
          {categoryFields.map((field, index) => (
            <div
              key={field.id}
              className={`justify-left grid grid-cols-[1fr_auto] items-center gap-1`}
            >
              <div className="border p-2.5 rounded-lg">
                <p className="text-sm whitespace-nowrap truncate">
                  {form.watch(`${name}.${index}.name`) || "Untitled Document"}
                </p>
              </div>

              <div>
                {/* Delete button */}
                <Button
                  type="button"
                  onClick={() =>
                    removeCategory(form.getValues(`${name}.${index}.id`), index)
                  }
                  variant="ghost"
                  size={"icon8"}
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
