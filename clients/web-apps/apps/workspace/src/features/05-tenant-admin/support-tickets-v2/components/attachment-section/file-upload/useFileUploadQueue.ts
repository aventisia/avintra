import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { FileUploadDto } from "@/components/file-uploader/apis/file-upload-apis";

import type { FileQueueItem } from "./types";
import { deduplicateFiles } from "./utils";

/**
 * Manages the ticket attachment upload queue.
 */
export const useFileUploadQueue = () => {
  const [fileQueue, setFileQueue] = useState<FileQueueItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  /** Update the status fields of a single file in the queue */
  const updateFileStatus = useCallback(
    (
      id: string,
      update: Partial<Pick<FileQueueItem, "status" | "stageMessage" | "errorMessage">>,
    ) => {
      setFileQueue((prev) => prev.map((f) => (f.id === id ? { ...f, ...update } : f)));
    },
    [],
  );

  /** Update the upload progress percentage of a single file */
  const updateProgress = useCallback((id: string, progress: number) => {
    setFileQueue((prev) => prev.map((f) => (f.id === id ? { ...f, progress } : f)));
  }, []);

  /** Attach the uploaded blob metadata to a single file */
  const setUploadedData = useCallback((id: string, uploadedData: FileUploadDto) => {
    setFileQueue((prev) => prev.map((f) => (f.id === id ? { ...f, uploadedData } : f)));
  }, []);

  /** Handle new files being dropped or selected — deduplicates before adding */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const dedupedFiles = deduplicateFiles(fileQueue, acceptedFiles);

      if (dedupedFiles.length < acceptedFiles.length) {
        const skipped = acceptedFiles.length - dedupedFiles.length;
        toast.info(`${skipped} duplicate file(s) skipped`);
      }

      // Queue the files for upload
      const newItems: FileQueueItem[] = dedupedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "queued" as const,
        stageMessage: "Queued",
        progress: 0,
      }));

      setFileQueue((prev) => [...prev, ...newItems]);
    },
    [fileQueue],
  );

  const handleRemoveFile = useCallback((id: string) => {
    setFileQueue((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const setActive = useCallback(
    (id: string | null) => {
      setActiveFileId(id);
      if (id) {
        updateFileStatus(id, { status: "uploading", stageMessage: "Uploading..." });
      }
    },
    [updateFileStatus],
  );

  const markCompleted = useCallback(
    (id: string) => {
      updateFileStatus(id, { status: "completed", stageMessage: "Upload complete" });
    },
    [updateFileStatus],
  );

  const markFailed = useCallback(
    (id: string, errorMessage?: string) => {
      updateFileStatus(id, {
        status: "failed",
        stageMessage: "Upload failed",
        errorMessage,
      });
    },
    [updateFileStatus],
  );

  // -- Derived state ---------------------------------------------------------

  const completedCount = fileQueue.filter((f) => f.status === "completed").length;
  const totalCount = fileQueue.length;
  const activeFile = activeFileId ? fileQueue.find((f) => f.id === activeFileId) : null;
  const isPending = fileQueue.some((f) => f.status === "uploading" || f.status === "registering");

  return {
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
    updateFileStatus,
    updateProgress,
    setUploadedData,
  };
};
