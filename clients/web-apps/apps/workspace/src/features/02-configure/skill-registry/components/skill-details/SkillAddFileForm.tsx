import { SubmitButton } from "@avplatform/ui/buttons";
import { Form } from "@avplatform/ui/form";
import { ScrollArea } from "@avplatform/ui/scroll";
import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { registerSkillFile } from "../../apis/skill-registry-file.apis";
import { DATA_QUERY_KEY, DETAIL_DATA_QUERY_KEY } from "../../constants";
import { useDefineSkillAddFilesForm } from "../../hooks/useDefineSkillAddFilesForm.hook";
import {
  FileDropZone,
  FileQueueList,
  UploadProgressSummary,
  useFileUploadQueue,
} from "./file-upload";

/**
 * Form for uploading files to a skills entry.
 */
export const SkillAddFileForm = ({
  skillId,
  skillName,
  onCompleted,
}: {
  skillId: string;
  skillName: string;
  onCompleted: () => void;
}) => {
  const { form } = useDefineSkillAddFilesForm();
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
  } = useFileUploadQueue();

  const { mutate: submitFiles, isPending: isSubmitPending } = useMutation({
    mutationFn: async () => {
      let successCount = 0;
      let failureCount = 0;

      for (const fileItem of fileQueue) {
        setActive(fileItem.id);
        try {
          await registerSkillFile(skillId, {
            fileName: fileItem.file.name,
            content: fileItem.content,
          });
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
        queryKey: [...DETAIL_DATA_QUERY_KEY, skillId],
      });
      await queryClient.invalidateQueries({
        queryKey: DATA_QUERY_KEY,
      });

      if (failureCount === 0) {
        toast.success(`${successCount} file(s) added to ${skillName} successfully`);
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

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-0 p-0 h-full">
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
          />
        </div>
      </div>
    </Form>
  );
};
