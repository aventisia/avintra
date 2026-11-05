import { EmptyState } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { DownloadSimpleIcon, PaperclipIcon, TrashIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { TicketAttachmentDto } from "../../dtos/TicketDto";
import { TicketDetailApiAdapter } from "../../types/ticket-detail-api-adapter.type";
import { TicketAttachmentUploadDialog } from "./TicketAttachmentUploadDialog";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface AttachmentSectionProps {
  ticketId: string;
  attachments: TicketAttachmentDto[];
  api: TicketDetailApiAdapter;
  isClosed?: boolean;
}

export const AttachmentSection = ({
  ticketId,
  attachments,
  api,
  isClosed = false,
}: AttachmentSectionProps) => {
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const invalidateTicket = () => {
    queryClient.invalidateQueries({ queryKey: ["support-ticket-v2", ticketId] });
  };

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) => api.deleteAttachment(ticketId, attachmentId),
    onSuccess: (res) => {
      if (res.data) {
        toast.success("Attachment deleted");
        invalidateTicket();
      } else {
        toast.error(res.message || "Failed to delete attachment");
      }
    },
    onError: () => toast.error("Failed to delete attachment"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-heading">Attachments ({attachments.length})</h2>
        {!isClosed && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setUploadDialogOpen(true)}
          >
            <PaperclipIcon className="mr-2 h-4 w-4" />
            Add attachment
          </Button>
        )}
      </div>

      {attachments.length === 0 ? (
        <EmptyState primaryMessage="No attachments yet" className="py-6" />
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between rounded-lg border border-line bg-surface p-3"
            >
              <div className="flex items-center gap-3">
                <PaperclipIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{attachment.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.fileSize)} &middot;{" "}
                    {attachment.uploadedOn
                      ? new Date(attachment.uploadedOn).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="icon9"
                  variant="ghost"
                  onClick={() =>
                    window.open(
                      `${import.meta.env.VITE_WORKSPACE_API_PATH}/file/download?fileUrl=${encodeURIComponent(attachment.filePath)}`,
                      "_blank",
                    )
                  }
                >
                  <DownloadSimpleIcon className="h-4 w-4" />
                </Button>
                {!isClosed && (
                  <Button
                    type="button"
                    size="icon9"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(attachment.id || "")}
                    disabled={deleteMutation.isPending}
                  >
                    <TrashIcon className="h-4 w-4 text-bad" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <TicketAttachmentUploadDialog
        ticketId={ticketId}
        api={api}
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  );
};
