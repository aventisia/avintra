import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { FileArrowUpIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useShallow } from "zustand/react/shallow";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { getFieldInputClassName } from "@/components/card-dialog/field-input.util";
import { getMergedQueryData } from "@/utils/get-merged-query-data.util";
import { pluralize } from "@/utils/pluralize.util";

import { QueuesTableDto } from "../../../dtos/queues-table-dto";
import { useTableTab } from "../../../hooks/useTableTab";
import { useUploadItemMutation } from "../../../hooks/useUploadItemMutation";
import { useQueueUploadItemsStore } from "../../../stores/queues-upload-item-store";
import { UploadedItemsTable } from "../uploadItems-select-table/UploadedItemsTable";

/**
 * Card dialog that loads work items from a JSON, CSV or Excel file and uploads them to a queue.
 */
export const UploadItemsForm = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const remarkId = useId();
  const [uploadedData, setUploadedData] = useState<unknown[]>([]);
  const [remark, setRemark] = useState<string>();

  const { uploadedItems, rowId, setShowDialog } = useQueueUploadItemsStore(
    useShallow((state) => ({
      uploadedItems: state.uploadedItems,
      rowId: state.rowId,
      setShowDialog: state.setShowDialog,
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

  const queryClient = useQueryClient();
  const { queryKey } = useTableTab();
  const queueName = getMergedQueryData<QueuesTableDto>(queryClient, queryKey)?.data.find(
    (queue) => queue.id === rowId,
  )?.name;
  const itemCount = Array.isArray(uploadedData) ? uploadedData.length : 0;

  return (
    <CardDialog
      isOpen
      onClose={() => setShowDialog(false)}
      isDismissLocked={isPending}
      isOutsideClickLocked={itemCount > 0 || Boolean(remark)}
      widthClassName="w-[min(60rem,calc(100vw-2rem))]"
      mark={
        <IconTile Icon={UploadSimpleIcon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />
      }
      eyebrow="Upload items"
      title={queueName || "Queue"}
      footer={
        <>
          <StatusLine tone={itemCount > 0 ? "pending" : "idle"}>
            {itemCount > 0
              ? `${itemCount} ${pluralize(itemCount, "item")} ready to upload`
              : "JSON, CSV or Excel"}
          </StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={() => setShowDialog(false)} disabled={isPending}>
              Cancel
            </CardDialogButton>
            <CardDialogButton onClick={() => fileInputRef.current?.click()} disabled={isPending}>
              <FileArrowUpIcon className="size-4" />
              Browse file
            </CardDialogButton>
            <CardDialogButton
              variant="primary"
              onClick={onSubmit}
              disabled={isPending}
              isBusy={isPending}
            >
              {isPending ? "Uploading" : "Upload"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".json,application/json,.csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
      />
      <div className="space-y-4">
        {uploadedItems && (
          <UploadedItemsTable setUploadedData={setUploadedData} uploadedData={uploadedData} />
        )}
        <FormField htmlFor={remarkId} label="Remark" isOptional>
          <textarea
            id={remarkId}
            rows={3}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="e.g. March invoices batch"
            className={cn(getFieldInputClassName(false), "block resize-none py-2.5 leading-5")}
          />
        </FormField>
      </div>
    </CardDialog>
  );
};
