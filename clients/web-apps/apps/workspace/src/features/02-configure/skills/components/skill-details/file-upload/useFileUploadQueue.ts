import { toast } from "@avplatform/ui/sonner";
import { useCallback, useState } from "react";

import type { FileQueueItem } from "./types";
import { deduplicateFiles, fileToText } from "./utils";

/**
 * Manages the skill file upload queue.
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

  /** Handle new files being dropped or selected — deduplicates before adding */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const dedupedFiles = deduplicateFiles(fileQueue, acceptedFiles);

      if (dedupedFiles.length < acceptedFiles.length) {
        const skipped = acceptedFiles.length - dedupedFiles.length;
        toast.info(`${skipped} duplicate file(s) skipped`);
      }

      // Read files as plain text and queue them
      const newItems: FileQueueItem[] = await Promise.all(
        dedupedFiles.map(async (file) => ({
          id: crypto.randomUUID(),
          file,
          content: await fileToText(file),
          dataUri: "",
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

  const setActive = useCallback(
    (id: string | null) => {
      setActiveFileId(id);
      if (id) {
        updateFileStatus(id, { status: "registering", stageMessage: "Registering file..." });
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
  const isPending = fileQueue.some((f) => f.status === "registering");

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
  };
};
