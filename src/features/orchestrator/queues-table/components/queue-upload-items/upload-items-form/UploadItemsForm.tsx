import { SubmitButton } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { useEffect } from "react";
import { read, utils } from "xlsx";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";
import { FileUploadDropzone } from "@/react-toolkit/ui/file-dropzone";

import { uploadWorkItem } from "../../../apis/queues-table-apis";
import { queueUploadFileZodSchema } from "../../../constants/queue-zod-schema";
import { QueueWorkItemDto } from "../../../dtos/queue-work-item-dto";
import { useDefineFileUploadForm } from "../../../hooks/useDefineFileUploadForm";
import { useQueueUploadItemsStore } from "../../../stores/queues-upload-item-store";
import { UploadedItemsTable } from "../uploadItems-select-table/UploadedItemsTable";

export const UploadItemsForm = () => {
  const { form, rowId, refineFormData } = useDefineFileUploadForm();

  const { uploadedItems, setUploadedItems } = useQueueUploadItemsStore(
    useShallow((state) => ({
      uploadedItems: state.uploadedItems,
      setUploadedItems: state.setUploadedItems,
    })),
  );

  // Get data-table crud dialog store state and actions
  const { setShowDialog } = useDTCrudDialogStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  // Use optimistic mutation to mark notification as read
  const { mutate: mutateUploadWorkItem, isPending } = useOptimisticMutation<
    QueueWorkItemDto,
    QueueWorkItemDto,
    boolean
  >(uploadWorkItem, ["work-item", rowId], undefined);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileData = e.target?.result;

      const workbook = read(fileData, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

      // Extract headers and rows
      const [headers, ...rows] = jsonData as string[][];
      setUploadedItems(
        rows.map((row) =>
          row.reduce((acc, val, i) => ({ ...acc, [headers[i]]: val }), {}),
        ),
      );
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    form.setValue("payloadData", JSON.stringify(uploadedItems), {
      shouldDirty: true,
    });
  }, [uploadedItems, form]);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof queueUploadFileZodSchema>) => {
    // Create or update the queue
    mutateUploadWorkItem(
      refineFormData(formData) as unknown as QueueWorkItemDto,
    );
    setShowDialog(false);
    setUploadedItems([]);
  };

  return (
    <div>
      <Form
        methods={form}
        onSubmit={form.handleSubmit(onSubmit)}
        className="px-2.5 pb-5"
      >
        <FileUploadDropzone
          description="spredsheet file types allowed, eg .xlsx,.csv"
          multiple={false}
          accept={{
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
              [], // .xlsx
            "text/csv": [], // .csv
          }}
          onDrop={(e) => handleFileUpload(e[0] as File)}
        />

        {uploadedItems && <UploadedItemsTable data={uploadedItems} />}
        <div className="!mt-10 flex w-full justify-end">
          <SubmitButton isPending={isPending} className={cn("min-w-[5rem]")}>
            Upload
          </SubmitButton>
        </div>
      </Form>
    </div>
  );
};
