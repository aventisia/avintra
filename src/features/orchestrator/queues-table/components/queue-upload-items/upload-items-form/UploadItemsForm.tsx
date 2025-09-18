import { Input } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { useEffect, useState } from "react";
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

  const { uploadedItems, rowId } = useQueueUploadItemsStore(
    useShallow((state) => ({
      uploadedItems: state.uploadedItems,
      rowId: state.rowId,
      setUploadedItems: state.setUploadedItems,
    })),
  );
  useEffect(() => {
    if (uploadedItems && uploadedItems?.length > 0)
      setUploadedData(uploadedItems);
  }, [uploadedItems]);
  // Use optimistic mutation to mark notification as read
  const { mutate: mutateUploadWorkItem, isPending } = useUploadItemMutation();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line no-debugger
    debugger;
    event.preventDefault();
    const file = event.target.files?.[0];

    if (!file) return;

    const isJson =
      file.type === "application/json" || file.name.endsWith(".json");
    const isCsv = file.type === "text/csv" || file.name.endsWith(".csv");

    if (!isJson && !isCsv) {
      console.error("Unsupported file type");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;

        if (isJson) {
          const parsedData = JSON.parse(content);
          console.log("JSON data:", parsedData);
          setUploadedData(parsedData);
        } else if (isCsv) {
          // const parsedData = parseCSV(content);
          const parsedData = parseCSVGeneric(content);
          console.log("CSV data:", parsedData);
          setUploadedData(parsedData);
        }
      } catch (err) {
        console.error("Error parsing file:", err);
        // setJsonData([]);
      }
    };

    reader.onerror = () => {
      console.error("File reading error");
    };

    reader.readAsText(file);
  };

  // Define submit handler
  const onSubmit = () => {
    // Create or update the queue
    mutateUploadWorkItem({
      queueId: rowId,
      payloadData: JSON.stringify(uploadedData),
    });
  };

  const parseCSVGeneric = (
    csvText: string,
  ): Record<string, string | number>[] => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim());

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string | number> = {};

      headers.forEach((header, index) => {
        const value = values[index] ?? "";
        row[header] = isNaN(Number(value)) ? value : Number(value);
      });

      return row;
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
          accept=".json,application/json,.csv,text/csv"
        />
      </div>
      {uploadedItems && (
        <UploadedItemsTable
          setUploadedData={setUploadedData}
          uploadedData={uploadedData}
        />
      )}
      <div className="!mt-5 flex w-full justify-end">
        <Button
          disabled={isPending}
          className={cn("min-w-[5rem]")}
          onClick={onSubmit}
        >
          {isPending ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
};
