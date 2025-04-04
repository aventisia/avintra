import { DialogContent, DialogDefaultHeader } from "@/react-toolkit/ui/dialog";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { QueueUploadItemsDialogWrapper } from "./QueueUploadItemsDialogWrapper";
import { useDropzone } from "react-dropzone";
import { Form } from "@/react-toolkit/ui/form/Form";
import { useDefineFileUploadForm } from "../../hooks/useDefineFileUploadForm";
import { z } from "zod";
import { queueUploadFileZodSchema } from "../../constants/queue-zod-schema";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { useState } from "react";
import { UploadedItemsTable } from "./uploadItems-select-table/UploadedItemsTable";

import { read, utils } from "xlsx";
export const QueueUploadItemsDialog = ({
  children,
}: React.PropsWithChildren) => {
  // Define queue form
  const { form } = useDefineFileUploadForm();
  const [data, setData] = useState<object[]>(); // State to store parsed data

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof queueUploadFileZodSchema>) => {
    console.log(formData);
  };

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

  console.log(data);
  // Return dialog
  return (
    <QueueUploadItemsDialogWrapper>
      {children}
      <DialogContent side={"right"} className="w-[50vw] !max-w-[50vw]">
        <DialogDefaultHeader
          heading="Upload Items"
        />
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
                className="flex h-[calc(50vh-15rem)] !items-center justify-center rounded-md border"
              >
                <p className="text-muted-foreground">
                  Drop spreadsheet file here
                </p>
              </div>
            </div>
            {data && <UploadedItemsTable data={data} />}
            <div className="!mt-10 flex w-full justify-end">
              <Button type="submit" className="min-w-[5rem]">
                Upload
              </Button>
            </div>
          </Form>
        </ScrollArea>
      </DialogContent>
    </QueueUploadItemsDialogWrapper>
  );
};
