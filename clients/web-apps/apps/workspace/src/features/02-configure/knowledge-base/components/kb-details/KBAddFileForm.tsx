import { Form, InputField, crudDialogFieldClasses } from "@avplatform/ui/form";
import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { FilePlusIcon } from "@phosphor-icons/react";
import { z } from "zod";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { pluralize } from "@/utils/pluralize.util";

import { kbAddFilesSchema } from "../../constants/kb-add-files-zod-schema";
import { chunkOverlapProps, chunkSizeProps } from "../../constants/kb-add-text-feild-props";
import { useDefineKBAddFilesForm } from "../../hooks/useDefineKBAddFilesForm";
import FileUploadDisclaimer from "./FileUploadDisclaimer";
import {
  FileDropZone,
  FileQueueList,
  type KBAddFileFormProps,
  UploadProgressSummary,
  useFileUploadQueue,
} from "./file-upload";

/**
 * Card dialog that queues files, sets chunking, and uploads them to a knowledge base.
 */
export const KBAddFileForm = ({
  knowledgeBaseId,
  knowledgeBaseName,
  knowledgeBase,
  onCompleted,
}: KBAddFileFormProps) => {
  const { form } = useDefineKBAddFilesForm();

  const {
    fileQueue,
    activeFileId,
    activeFile,
    isPending,
    completedCount,
    totalCount,
    onDrop,
    handleRemoveFile,
    submitFiles,
  } = useFileUploadQueue({
    knowledgeBaseId,
    knowledgeBaseName,
    knowledgeBase,
    onCompleted,
  });

  const onSubmit = (data: z.infer<typeof kbAddFilesSchema>) => {
    submitFiles(data);
  };

  const handleSubmit = form.handleSubmit(onSubmit);
  const fileCount = fileQueue.length;

  return (
    <CardDialog
      isOpen
      onClose={onCompleted}
      isDismissLocked={isPending}
      isOutsideClickLocked={fileCount > 0}
      widthClassName="w-[min(42rem,calc(100vw-2rem))]"
      mark={
        <IconTile Icon={FilePlusIcon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />
      }
      eyebrow="Add files"
      title={knowledgeBaseName}
      footer={
        <>
          <StatusLine tone={isPending ? "pending" : "idle"}>
            {isPending
              ? `Processing ${completedCount} of ${totalCount}`
              : fileCount > 0
                ? `${fileCount} ${pluralize(fileCount, "file")} selected`
                : "No files selected"}
          </StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={onCompleted} disabled={isPending}>
              Cancel
            </CardDialogButton>
            <CardDialogButton
              variant="primary"
              onClick={handleSubmit}
              disabled={isPending || fileCount === 0}
              isBusy={isPending}
            >
              {isPending ? "Processing" : "Upload"}
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

        <div className={cn("grid grid-cols-2 gap-4", isPending ? "hidden" : "grid")}>
          <InputField {...chunkSizeProps} className={crudDialogFieldClasses.input} />
          <InputField {...chunkOverlapProps} className={crudDialogFieldClasses.input} />
        </div>
        {!isPending && <FileUploadDisclaimer className="px-0 leading-5 text-muted-foreground" />}
      </Form>
    </CardDialog>
  );
};
