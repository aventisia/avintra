import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";

import { SubmitButton } from "@aventisia/ui/buttons";
import { DialogContent, DialogDefaultHeader } from "@aventisia/ui/dialog";
import { Form } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { read, utils } from "xlsx";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { uploadWorkItem } from "../../apis/queues-table-apis";
import { queueUploadFileZodSchema } from "../../constants/queue-zod-schema";
import { QueueWorkItemDto } from "../../dtos/queue-work-item-dto";
import { useDefineFileUploadForm } from "../../hooks/useDefineFileUploadForm";
import { useQueueUploadItemsStore } from "../../stores/queues-upload-item-store";
import { QueueUploadItemsDialogWrapper } from "./QueueUploadItemsDialogWrapper";
import { UploadedItemsTable } from "./uploadItems-select-table/UploadedItemsTable";

export const QueueUploadItemsDialog = ({
  children,
}: React.PropsWithChildren) => {
  // Define queue form
  const { form, rowId, refineFormData } = useDefineFileUploadForm();
  const [data, setData] = useState<object[]>(); // State to store parsed data

  // Use optimistic mutation to mark notification as read
  const {
    mutate: mutateUploadWorkItem,
    isPending,
    isSuccess,
  } = useOptimisticMutation<QueueWorkItemDto, QueueWorkItemDto, boolean>(
    uploadWorkItem,
    ["work-item", rowId],
  );

  const { setShowDialog } = useQueueUploadItemsStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  useEffect(() => {
    setData(undefined);
  }, [isSuccess, setShowDialog]);

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
      setData(
        rows.map((row) =>
          row.reduce((acc, val, i) => ({ ...acc, [headers[i]]: val }), {}),
        ),
      );
    };

    reader.readAsArrayBuffer(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], // .xlsx
      "text/csv": [], // .csv
    },
    onDrop: (e) => handleFileUpload(e[0] as File),
  });

  useEffect(() => {
    form.setValue("payloadData", JSON.stringify(data), {
      shouldDirty: true,
    });
  }, [data, form]);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof queueUploadFileZodSchema>) => {
    // Create or update the queue
    mutateUploadWorkItem(
      refineFormData(formData) as unknown as QueueWorkItemDto,
    );
  };

  useEffect(() => {
    if (isPending && !isSuccess) {
      setShowDialog(false);
    }
  });
  // Return dialog
  return (
    <QueueUploadItemsDialogWrapper>
      {children}
      <DialogContent side={"right"} className="w-[50vw] !max-w-[50vw]">
        <DialogDefaultHeader heading="Upload Items" />
        <ScrollArea className="h-[calc(100vh-10rem)] px-2.5 pb-0 pt-4">
          <Form
            methods={form}
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-2.5 pb-5"
          >
            <div
              className="flex w-full items-center justify-center"
              {...getRootProps()}
            >
              <label
                htmlFor="dropzone-file"
                className="dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pb-2 pt-5">
                  <UploadCloud className="h-10 w-10 text-muted-foreground" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    spredsheet file types allowed, eg .xlsx,.csv
                  </p>
                </div>
                <input {...getInputProps()} />
              </label>
            </div>

            {data && <UploadedItemsTable data={data} />}
            <div className="!mt-10 flex w-full justify-end">
              <SubmitButton
                isPending={isPending}
                className={cn("min-w-[5rem]")}
              >
                Upload
              </SubmitButton>
            </div>
          </Form>
        </ScrollArea>
      </DialogContent>
    </QueueUploadItemsDialogWrapper>
  );
};
