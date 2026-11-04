import { IconTile } from "@avplatform/ui/icon-tile";
import { toast } from "@avplatform/ui/sonner";
import { PaperclipIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { deleteFile, uploadFile } from "@/components/file-uploader/apis/file-upload-apis";
import { pluralize } from "@/utils/pluralize.util";

import { TicketAttachmentDto } from "../../dtos/TicketDto";
import { TicketDetailApiAdapter } from "../../types/ticket-detail-api-adapter.type";
import {
  FileDropZone,
  FileQueueList,
  UploadProgressSummary,
  useFileUploadQueue,
} from "./file-upload";
import type { FileQueueItem } from "./file-upload/types";

/**
 * Card dialog for uploading attachment files to a ticket.
 * Each file is first uploaded to blob storage, then registered on the ticket.
 */
export const TicketAddAttachmentForm = ({
  isOpen,
  ticketId,
  api,
  queue,
  onCompleted,
}: {
  isOpen: boolean;
  ticketId: string;
  api: TicketDetailApiAdapter;
  queue: ReturnType<typeof useFileUploadQueue>;
  onCompleted: () => void;
}) => {
  const queryClient = useQueryClient();

  const {
    fileQueue,
    activeFileId,
    activeFile,
    isPending,
    completedCount,
    totalCount,
    onDrop,
    handleRemoveFile,
    setActive,
    markCompleted,
    markFailed,
    updateProgress,
    setUploadedData,
  } = queue;

  const { mutate: submitFiles, isPending: isSubmitPending } = useMutation({
    mutationFn: async () => {
      let successCount = 0;
      let failureCount = 0;

      for (const fileItem of fileQueue) {
        setActive(fileItem.id);
        try {
          // 1. Upload the file to blob storage (drives the progress bar)
          const uploaded = await uploadFile(fileItem.file, (_, progress) =>
            updateProgress(fileItem.id, progress),
          );
          setUploadedData(fileItem.id, uploaded);

          // 2. Register the blob on the ticket
          updateProgress(fileItem.id, 100);
          const dto: TicketAttachmentDto = {
            ticketId,
            fileName: uploaded.name,
            filePath: uploaded.path,
            fileSize: uploaded.size,
            extension: uploaded.extension,
          };
          await api.createAttachment(ticketId, dto);
          markCompleted(fileItem.id);
          successCount++;
        } catch (error) {
          markFailed(fileItem.id, (error as Error).message);
          failureCount++;
          console.error("Error processing file:", fileItem.file.name, error);
        }
      }

      return { successCount, failureCount };
    },
    onSuccess: async ({ successCount, failureCount }) => {
      await queryClient.invalidateQueries({
        queryKey: ["support-ticket-v2", ticketId],
      });

      if (failureCount === 0) {
        toast.success(`${successCount} file(s) added to the ticket successfully`);
        onCompleted();
      } else if (successCount > 0) {
        toast.warning(
          `${successCount} file(s) succeeded, ${failureCount} file(s) failed. Check status above.`,
        );
      } else {
        toast.error("Files failed to upload. Please check the errors.");
      }
    },
    onError: (error) => {
      toast.error((error as Error).message || "Failed to upload files");
    },
  });

  const onSubmit = () => {
    submitFiles();
  };

  // Deletes a blob that was uploaded but never saved to the ticket, then removes it from the queue.
  const handleDeleteOrphan = async (fileItem: FileQueueItem) => {
    if (!fileItem.uploadedData) return;
    try {
      await deleteFile(fileItem.uploadedData);
      handleRemoveFile(fileItem.id);
      toast.success("Uploaded file deleted");
    } catch (error) {
      toast.error((error as Error).message || "Failed to delete uploaded file");
    }
  };

  const isBusy = isPending || isSubmitPending;
  const fileCount = fileQueue.length;

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={onCompleted}
      isDismissLocked={isBusy}
      isOutsideClickLocked={fileCount > 0}
      widthClassName="w-[min(42rem,calc(100vw-2rem))]"
      mark={
        <IconTile Icon={PaperclipIcon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />
      }
      eyebrow="Ticket"
      title="Add attachments"
      footer={
        <>
          <StatusLine tone={isBusy ? "pending" : "idle"}>
            {isBusy
              ? `Uploading ${completedCount} of ${totalCount}`
              : fileCount > 0
                ? `${fileCount} ${pluralize(fileCount, "file")} selected`
                : "No files selected"}
          </StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={onCompleted} disabled={isBusy}>
              Cancel
            </CardDialogButton>
            <CardDialogButton
              variant="primary"
              onClick={onSubmit}
              disabled={isBusy || fileCount === 0}
              isBusy={isBusy}
            >
              {isBusy ? "Uploading" : "Upload"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        {!isPending && <FileDropZone onDrop={onDrop} />}

        {fileCount > 0 && isPending && (
          <UploadProgressSummary
            completedCount={completedCount}
            totalCount={totalCount}
            activeFileName={activeFile?.file.name}
            activeStageMessage={activeFile?.stageMessage}
          />
        )}

        <FileQueueList
          files={fileQueue}
          activeFileId={activeFileId}
          isPending={isPending}
          onRemove={handleRemoveFile}
          onDeleteOrphan={handleDeleteOrphan}
        />
      </div>
    </CardDialog>
  );
};
