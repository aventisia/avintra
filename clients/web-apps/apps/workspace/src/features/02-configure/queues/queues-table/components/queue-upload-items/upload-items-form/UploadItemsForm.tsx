import { Input, LoadingSpinner, Textarea } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Label } from "@avplatform/ui/label";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useShallow } from "zustand/react/shallow";

import { useUploadItemMutation } from "../../../hooks/useUploadItemMutation";
import { useQueueUploadItemsStore } from "../../../stores/queues-upload-item-store";
import { UploadedItemsTable } from "../uploadItems-select-table/UploadedItemsTable";

export const UploadItemsForm = ({
  fileInputRef,
}: {
  fileInputRef: React.RefObject<HTMLInputElement>;
}) => {
  const [uploadedData, setUploadedData] = useState<unknown[]>([]);
  const [remark, setRemark] = useState<string>();

  const { uploadedItems, rowId } = useQueueUploadItemsStore(
    useShallow((state) => ({
      uploadedItems: state.uploadedItems,
      rowId: state.rowId,
      setUploadedItems: state.setUploadedItems,
    })),
  );

  // When a different queue is selected (rowId changes) the dialog content stays
  // mounted, so reset any previously-uploaded items and the remark to avoid
  // leaking them into the newly-opened queue.
  useEffect(() => {
    setUploadedData([]);
    setRemark("");
  }, [rowId]);

  useEffect(() => {
    if (uploadedItems && uploadedItems?.length > 0) setUploadedData(uploadedItems);
  }, [uploadedItems]);
  // Use optimistic mutation to mark notification as read
  const { mutate: mutateUploadWorkItem, isPending } = useUploadItemMutation();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.target.files?.[0];

    if (!file) return;

    // Clear the input value so the SAME file can be selected again on a
    // subsequent upload attempt. Otherwise onChange won't fire again and the
    // upload form would silently keep stale (or empty) data.
    event.target.value = "";

    const isJson = file.type === "application/json" || file.name.endsWith(".json");
    const isCsv = file.type === "text/csv" || file.name.endsWith(".csv");
    const isExcel =
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";

    if (!isJson && !isCsv && !isExcel) {
      console.error("Unsupported file type");
      return;
    }

    // JSON is read as text; CSV is read as text; Excel is read as an ArrayBuffer.
    if (isJson) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedData = JSON.parse(content);
          console.log("JSON data:", parsedData);
          setUploadedData(parsedData);
        } catch (err) {
          console.error("Error parsing file:", err);
        }
      };

      reader.onerror = () => {
        console.error("File reading error");
      };

      reader.readAsText(file);
      return;
    }

    if (isCsv) {
      // CSV is text, so read it as a string and let xlsx parse it (handles
      // quoted fields, CRLF line endings, and empty lines).
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const workbook = XLSX.read(content, { type: "string" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const parsedData = XLSX.utils.sheet_to_json<Record<string, string | number>>(firstSheet, {
            defval: "",
          });
          console.log("CSV data:", parsedData);
          setUploadedData(parsedData);
        } catch (err) {
          console.error("Error parsing file:", err);
        }
      };

      reader.onerror = () => {
        console.error("File reading error");
      };

      reader.readAsText(file);
      return;
    }

    // Excel files are binary, so read them as an ArrayBuffer.
    file.arrayBuffer().then((buffer) => {
      try {
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsedData = XLSX.utils.sheet_to_json<Record<string, string | number>>(firstSheet, {
          defval: "",
        });
        console.log("Excel data:", parsedData);
        setUploadedData(parsedData);
      } catch (err) {
        console.error("Error parsing file:", err);
      }
    });
  };

  // Define submit handler
  const onSubmit = () => {
    if (!Array.isArray(uploadedData) || uploadedData.length === 0) {
      toast.error("No work items to upload. Please select a file first.");
      return;
    }

    // Create or update the queue
    mutateUploadWorkItem({
      queueId: rowId,
      payloadData: JSON.stringify(uploadedData),
      ...(remark?.trim() && { remarks: remark.trim() }),
    });
  };

  return (
    <div className="space-y-0 px-2.5 pb-5">
      <div className="flex justify-between">
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".json,application/json,.csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        />
      </div>
      {uploadedItems && (
        <UploadedItemsTable setUploadedData={setUploadedData} uploadedData={uploadedData} />
      )}
      <div className="pt-2">
        <Label className="ml-1 text-xs">Remark </Label>
        <Textarea value={remark} onChange={(e) => setRemark(e.target.value)} />
      </div>
      <div className="!mt-5 flex w-full justify-end">
        <Button disabled={isPending} className={cn("min-w-[5rem] gap-2")} onClick={onSubmit}>
          {isPending ? (
            <>
              <LoadingSpinner className="h-4 w-4" />
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </div>
    </div>
  );
};
