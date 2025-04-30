import { Loader2, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { read, utils } from "xlsx";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";
import { cn } from "@/react-toolkit/lib/utils";
import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
import { DialogContent, DialogDefaultHeader } from "@/react-toolkit/ui/dialog";
import { Form } from "@/react-toolkit/ui/form/Form";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";

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
    setShowDialog(!isSuccess);
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
            <div>
              <input {...getInputProps()} />
              <div
                {...getRootProps()}
                className="flex h-[calc(50vh-15rem)] border-separate border-spacing-1 !items-center justify-center rounded-lg border-2 border-dashed"
              >
                <p className="flex gap-2 text-muted-foreground">
                  <UploadCloud /> Drop spreadsheet file here
                </p>
              </div>
            </div>
            {data && <UploadedItemsTable data={data} />}
            <div className="!mt-10 flex w-full justify-end">
              <SubmitButton
                isPending={isPending}
                className={cn("min-w-[5rem]")}
              >
                <span className="group flex gap-2">
                  {isPending && (
                    <Loader2 className={cn("h-5 w-5", "animate-spin")} />
                  )}
                  <span>Upload</span>
                </span>
              </SubmitButton>
            </div>
          </Form>
        </ScrollArea>
      </DialogContent>
    </QueueUploadItemsDialogWrapper>
  );
};
