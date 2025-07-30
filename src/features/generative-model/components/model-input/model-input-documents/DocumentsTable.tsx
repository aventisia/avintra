import { useToggleFileUploadDialogStore } from "@/features/ai-persona-model/store/toggle-file-uploader-store";
import { deleteInsertedFileById } from "@/features/file-uploader-setup/apis/file-upload-apis";
import { generativeModelInputZodSchema } from "@/features/generative-model/constants/model-input-zod-schema";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";

import { Button } from "@aventisia/ui/buttons";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { toast } from "@aventisia/ui/sonner";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";

type DocumentsTableProps = {
  form: UseFormReturn<z.infer<typeof generativeModelInputZodSchema>>;
  taskType: "thoughtLeadership" | "companyDeepDives" | "documentDrafting";
};

const DocumentsTable = ({ form, taskType }: DocumentsTableProps) => {
  const { control } = form;
  const { data: fileList } = useFetchUploadedFiles("setup");

  const { setShowFileUploadDialog } = useToggleFileUploadDialogStore();
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const {
    fields: categoryFields,
    // append,
    remove,
  } = useFieldArray({
    control,
    name: `${taskType}.documents`,
  });
  type MutationParams = {
    id: string;
    index: number;
  };
  const { mutate: removeInsertedDocument } = useMutation({
    mutationFn: ({ id }: MutationParams) => deleteInsertedFileById(id),
    onSuccess: async (_data, variables) => {
      remove(variables.index); // ✅ Now TypeScript knows 'index' exists
      toast.success("File deleted successfully");
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Function to remove an object from categories
  const removeCategory = (id: string, index: number) => {
    showDefaultAlertDialog({
      confirmActionFn: () => {
        removeInsertedDocument({ id, index });
      },
      alertType: "delete-record",
      additionalText: `File`,
    });
  };

  useEffect(() => {
    if (fileList && fileList.data.length > 0) {
      const setupFormDocuments = fileList.data.map(({ id, name, path }) => {
        return { id: id ?? "", name, filePath: path ?? "" };
      });
      form.setValue(`${taskType}.documents`, setupFormDocuments);
    }
  }, [fileList, form, taskType]);

  return (
    <div className="space-y-4 border rounded-lg">
      <div className="flex items-center justify-between bg-muted rounded-t-lg px-3 py-2">
        <p className="text-md">Documents</p>
        <Button
          variant="ghost"
          size="icon8"
          onClick={() => setShowFileUploadDialog(true)}
          type="button"
        >
          <PlusIcon className="h-5 w-5 stroke-2 text-primary" />
        </Button>
      </div>
      {categoryFields.length > 0 && (
        <div className="!mt-0 inline-block w-full px-2 py-4 space-y-3">
          {categoryFields.map((field, index) => {
            return (
              <div
                key={field.id}
                className={`justify-left grid grid-cols-[1fr_auto] items-center gap-4`}
              >
                <div className="border rounded-lg px-2 py-2.5">
                  <p className="text-sm whitespace-nowrap truncate">
                    {form.watch(`${taskType}.documents.${index}.name`) ||
                      "Untitled Document"}
                  </p>
                </div>

                {/* Delete button */}
                <Button
                  type="button"
                  onClick={() =>
                    removeCategory(
                      form.getValues(`${taskType}.documents.${index}.id`),
                      index,
                    )
                  }
                  className="m-0 p-0"
                  variant="ghost"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentsTable;
