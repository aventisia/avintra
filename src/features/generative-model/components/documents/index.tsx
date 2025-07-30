/* eslint-disable @typescript-eslint/no-explicit-any */
import { deleteInsertedFileById } from "@/features/file-uploader-setup/apis/file-upload-apis";

import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";

import DocumentsTable from "./DocumentsTable";

type DocumentsProps = {
  form: UseFormReturn<z.infer<any>>;
  name: string;
  label: string;
};

type MutationParams = {
  id: string;
  index: number;
};

const Documents = ({ form, name, label }: DocumentsProps) => {
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { control } = form;
  const {
    fields: documentFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name,
  });

  // Function to add a new object to categories
  const addDocument = () => {
    append([]);
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
  const removeDocument = (id: string, index: number) => {
    showDefaultAlertDialog({
      confirmActionFn: () => {
        removeInsertedDocument({ id, index });
      },
      alertType: "delete-record",
      additionalText: `File`,
    });
  };

  return (
    <div className="space-y-4">
      <DocumentsTable
        addCategory={addDocument}
        form={form}
        removeCategory={removeDocument}
        categoryFields={documentFields}
        name={name}
        label={label}
      />
    </div>
  );
};

export default Documents;
