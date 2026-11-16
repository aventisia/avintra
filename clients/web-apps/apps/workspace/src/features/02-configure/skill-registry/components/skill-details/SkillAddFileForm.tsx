import { Form } from "@avplatform/ui/form";
import { IconTile } from "@avplatform/ui/icon-tile";
import { toast } from "@avplatform/ui/sonner";
import { FilePlusIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { pluralize } from "@/utils/pluralize.util";

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
 * Card dialog that queues files and adds them to a skill.
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

  const handleSubmit = form.handleSubmit(onSubmit);
  const isBusy = isPending || isSubmitPending;
  const fileCount = fileQueue.length;

  return (
    <CardDialog
      isOpen
      onClose={onCompleted}
      isDismissLocked={isBusy}
      isOutsideClickLocked={fileCount > 0}
      widthClassName="w-[min(42rem,calc(100vw-2rem))]"
      mark={
        <IconTile Icon={FilePlusIcon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />
      }
      eyebrow="Add files"
      title={skillName}
      footer={
        <>
          <StatusLine tone={isBusy ? "pending" : "idle"}>
            {isBusy
              ? `Processing ${completedCount} of ${totalCount}`
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
              onClick={handleSubmit}
              disabled={isBusy || fileCount === 0}
              isBusy={isBusy}
            >
              {isBusy ? "Processing" : "Upload"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      <Form methods={form} onSubmit={handleSubmit}>
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
        />
      </Form>
    </CardDialog>
  );
};
