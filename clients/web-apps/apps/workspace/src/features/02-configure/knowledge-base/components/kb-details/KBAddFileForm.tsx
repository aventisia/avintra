import { SubmitButton } from "@avplatform/ui/buttons";
import { Form, InputField } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { z } from "zod";

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
 * Form for uploading files to a knowledge base.
 *
 * Orchestrates:
 *  - Drag-and-drop file selection (FileDropZone)
 *  - Queued file list with per-file status (FileQueueList)
 *  - Sequential upload with progress tracking (useFileUploadQueue)
 *  - Chunk size / overlap configuration
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

            {/* Chunk configuration — hidden while uploading */}
            <div className={cn("grid grid-cols-2 gap-4", isPending ? "hidden" : "grid")}>
              <InputField {...chunkSizeProps} />
              <InputField {...chunkOverlapProps} />
            </div>
            {!isPending && <FileUploadDisclaimer />}
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="flex h-16 border-t px-4 justify-end gap-3 items-center">
          <SubmitButton
            size="sm"
            type="submit"
            isPending={isPending}
            primaryText="Submit"
            secondaryText={
              activeFileId ? `Processing... (${completedCount}/${totalCount})` : "Processing..."
            }
            disabled={isPending || fileQueue.length === 0}
          />
        </div>
      </div>
    </Form>
  );
};
