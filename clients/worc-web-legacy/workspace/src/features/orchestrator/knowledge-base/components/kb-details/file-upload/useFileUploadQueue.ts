import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { z } from "zod";

import {
  ingestVectorStoreInput,
  registerKnowledgeBaseFile,
} from "../../../apis/knowledge-base-file-apis";
import { DETAIL_DATA_QUERY_KEY } from "../../../constants";
import { kbAddFilesSchema } from "../../../constants/kb-add-files-zod-schema";
import type { KnowledgeBaseTableDto } from "../../../dtos/knowledge-base-table-dto";
import type { FileQueueItem } from "./types";
import { deduplicateFiles, fileToDataUri } from "./utils";

interface UseFileUploadQueueOptions {
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  knowledgeBase?: KnowledgeBaseTableDto;
  onCompleted: () => void;
}

/**
 * Manages the full file upload lifecycle:
 * - Queue management (add via drop, remove)
 * - Sequential upload with per-file status tracking
 * - Cache invalidation on completion
 */
export const useFileUploadQueue = ({
  knowledgeBaseId,
  knowledgeBaseName,
  knowledgeBase,
  onCompleted,
}: UseFileUploadQueueOptions) => {
  const queryClient = useQueryClient();
  const [fileQueue, setFileQueue] = useState<FileQueueItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // -- Queue helpers ---------------------------------------------------------

  /** Update the status fields of a single file in the queue */
  const updateFileStatus = useCallback(
    (
      id: string,
      update: Partial<
        Pick<FileQueueItem, "status" | "stageMessage" | "errorMessage">
      >,
    ) => {
      setFileQueue((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...update } : f)),
      );
    },
    [],
  );

  /** Handle new files being dropped or selected — deduplicates before adding */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const dedupedFiles = deduplicateFiles(fileQueue, acceptedFiles);

      if (dedupedFiles.length < acceptedFiles.length) {
        const skipped = acceptedFiles.length - dedupedFiles.length;
        toast.info(`${skipped} duplicate file(s) skipped`);
      }

      // Convert files to data URIs and queue them
      const newItems: FileQueueItem[] = await Promise.all(
        dedupedFiles.map(async (file) => ({
          id: crypto.randomUUID(),
          file,
          dataUri: await fileToDataUri(file),
          status: "queued" as const,
          stageMessage: "Queued",
        })),
      );

      setFileQueue((prev) => [...prev, ...newItems]);
    },
    [fileQueue],
  );

  const handleRemoveFile = useCallback((id: string) => {
    setFileQueue((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // -- Upload mutation -------------------------------------------------------

  /**
   * Processes each file sequentially:
   *   1. Register the file with the backend
   *   2. Send it for vector-store ingestion (chunking)
   * Failures are recorded per-file without aborting the remaining queue.
   */
  const { mutate: submitFiles, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof kbAddFilesSchema>) => {
      if (!knowledgeBase) {
        throw new Error("Knowledge base configuration is not available");
      }

      let successCount = 0;
      let failureCount = 0;

      for (const fileItem of fileQueue) {
        setActiveFileId(fileItem.id);

        try {
          // Stage 1: Register the file metadata
          updateFileStatus(fileItem.id, {
            status: "registering",
            stageMessage: "Registering file...",
          });

          const registered = await registerKnowledgeBaseFile(knowledgeBaseId, {
            fileUrl: fileItem.dataUri,
            fileName: fileItem.file.name,
            fileSizeInBytes: fileItem.file.size,
            fileExtension: fileItem.file.name.split(".").pop() || "",
            chunkSize: data.chunkSize,
            chunkOverlap: data.chunkOverlap,
          });

          // Stage 2: Ingest into the vector store
          updateFileStatus(fileItem.id, {
            status: "chunking",
            stageMessage: "Chunking in progress...",
          });

          await ingestVectorStoreInput({
            vector_store: knowledgeBase.vectorStore,
            embedding_provider: knowledgeBase.embeddingProvider,
            embedding_model: knowledgeBase.embeddingModel,
            input: fileItem.dataUri,
            metadata: {
              kb_id: knowledgeBaseId,
              kb_file_id: registered.data!.id,
              kb_name: knowledgeBaseName,
              kb_file_name: fileItem.file.name,
            },
            chunk_size: data.chunkSize,
            chunk_overlap: data.chunkOverlap,
            store_credential_id: knowledgeBase.storeCredentialId,
            embedding_credential_id: knowledgeBase.embeddingCredentialId,
            ref_type: "KnowledgeBase",
            ref_id: knowledgeBaseId,
            ref_name: knowledgeBaseName,
            action: "KnowledgeBaseFileIngest",
          });

          updateFileStatus(fileItem.id, {
            status: "completed",
            stageMessage: "Upload complete",
          });
          successCount++;
        } catch (error) {
          failureCount++;
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";

          updateFileStatus(fileItem.id, {
            status: "failed",
            stageMessage: "Upload failed",
            errorMessage,
          });
          // Continue processing remaining files
        }
      }

      setActiveFileId(null);
      return { successCount, failureCount };
    },

    onSuccess: async ({ successCount, failureCount }) => {
      await queryClient.invalidateQueries({
        queryKey: [...DETAIL_DATA_QUERY_KEY, knowledgeBaseId],
      });

      if (failureCount === 0) {
        toast.success(
          `${successCount} file(s) added to knowledge base successfully`,
        );
        setFileQueue([]);
        onCompleted();
      } else if (successCount > 0) {
        toast.warning(
          `${successCount} succeeded, ${failureCount} failed. Check status above.`,
        );
      } else {
        toast.error("All files failed to upload. Please check the errors.");
      }
    },

    onError: (error) => {
      setActiveFileId(null);
      toast.error((error as Error).message || "Upload process failed");
    },
  });

  // -- Derived state ---------------------------------------------------------

  const completedCount = fileQueue.filter(
    (f) => f.status === "completed",
  ).length;
  const totalCount = fileQueue.length;
  const activeFile = activeFileId
    ? fileQueue.find((f) => f.id === activeFileId)
    : null;

  return {
    fileQueue,
    activeFileId,
    activeFile,
    isPending,
    completedCount,
    totalCount,
    onDrop,
    handleRemoveFile,
    submitFiles,
  };
};
