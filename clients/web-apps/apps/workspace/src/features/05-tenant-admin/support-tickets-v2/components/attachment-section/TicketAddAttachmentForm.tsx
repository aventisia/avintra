import { SubmitButton } from "@avplatform/ui/buttons";
import { ScrollArea } from "@avplatform/ui/scroll";
import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteFile, uploadFile } from "@/components/file-uploader/apis/file-upload-apis";

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
 * Form for uploading attachment files to a ticket.
 * Each file is first uploaded to blob storage, then registered on the ticket.
 */
export const TicketAddAttachmentForm = ({
  ticketId,
  api,
  queue,
  onCompleted,
}: {
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

  return (
    <div className="flex flex-col justify-between h-full">
      <ScrollArea className="h-[calc(40rem-7.5rem)] p-4 pt-3">
        <div className="space-y-4 px-1">
          {/* Drop zone — hidden while upload is in progress */}
          {!isPending && <FileDropZone onDrop={onDrop} />}

          {/* Progress summary — visible only during upload */}
          {fileQueue.length > 0 && isPending && (
            <UploadProgressSummary
              completedCount={completedCount}
              totalCount={totalCount}
              activeFileName={activeFile?.file.name}
              activeStageMessage={activeFile?.stageMessage}
            />
          )}

          {/* Queued / in-progress / completed files */}
          <FileQueueList
            files={fileQueue}
            activeFileId={activeFileId}
            isPending={isPending}
            onRemove={handleRemoveFile}
            onDeleteOrphan={handleDeleteOrphan}
          />
        </div>
      </ScrollArea>

      {/* Footer actions */}
      <div className="flex h-16 border-t px-4 justify-end gap-3 items-center">
        <SubmitButton
          size="sm"
          type="submit"
          isPending={isPending || isSubmitPending}
          primaryText="Submit"
          secondaryText={
            activeFileId ? `Processing... (${completedCount}/${totalCount})` : "Processing..."
          }
          disabled={isPending || isSubmitPending || fileQueue.length === 0}
          onClick={onSubmit}
        />
      </div>
    </div>
  );
};
