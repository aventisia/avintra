import { useEffect } from "react";
import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";

import { deleteFile } from "@/components/file-uploader/apis/file-upload-apis";
import { TicketDetailApiAdapter } from "../../types/ticket-detail-api-adapter.type";
import { TicketAddAttachmentForm } from "./TicketAddAttachmentForm";
import { useFileUploadQueue } from "./file-upload";

interface TicketAttachmentUploadDialogProps {
  ticketId: string;
  api: TicketDetailApiAdapter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        side={"center"}
        className="!max-w-3xl h-[40rem] flex flex-col p-0 overflow-hidden"
      >
        <DialogDefaultHeader heading="Add Attachment" className="p-3 px-4" />
        <div className="flex-1 overflow-hidden">
          <TicketAddAttachmentForm
            ticketId={ticketId}
            api={api}
            queue={queue}
            onCompleted={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
