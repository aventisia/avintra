import { useEffect } from "react";

import { deleteFile } from "@/components/file-uploader/apis/file-upload-apis";

import { TicketDetailApiAdapter } from "../../types/ticket-detail-api-adapter.type";
import { TicketAddAttachmentForm } from "./TicketAddAttachmentForm";
import { useFileUploadQueue } from "./file-upload";

type TicketAttachmentUploadDialogProps = {
  ticketId: string;
  api: TicketDetailApiAdapter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const TicketAttachmentUploadDialog = ({
  ticketId,
  api,
  open,
  onOpenChange,
}: TicketAttachmentUploadDialogProps) => {
  const queue = useFileUploadQueue();

  // Auto-cleanup: when the dialog closes, delete any blobs that were uploaded
  // but never saved to the ticket (failed/aborted files with uploadedData).
  useEffect(() => {
    if (open) return;

    const orphans = queue.fileQueue.filter((f) => f.uploadedData && f.status !== "completed");
    orphans.forEach((orphan) => {
      if (orphan.uploadedData) {
        deleteFile(orphan.uploadedData).catch(() => {
          // Best-effort cleanup; ignore failures to avoid blocking the dialog close.
        });
      }
      queue.handleRemoveFile(orphan.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <TicketAddAttachmentForm
      isOpen={open}
      ticketId={ticketId}
      api={api}
      queue={queue}
      onCompleted={() => onOpenChange(false)}
    />
  );
};
