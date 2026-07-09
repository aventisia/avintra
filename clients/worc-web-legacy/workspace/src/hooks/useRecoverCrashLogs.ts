import { get, set } from "idb-keyval";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { JobStatusEnum } from "@/features/03-orchestrator/jobs-table/enums/job-status-enum";
import {
  AgentExecutionLogType,
  EXECUTION_LOG_KEY,
} from "@/features/execute-flow";
import { updateJobData } from "@/features/execute-flow/apis/job-trigger-apis";
import { useTuariUserMetadataStore } from "@/stores/tuari-user-metadata-store";

// Run check for pending logs if any and post them to respective job data
export const useRecoverCrashLogs = (): void => {
  const hasRun = useRef(false);

  const { osID } = useTuariUserMetadataStore(
    useShallow((state) => ({
      osID: state.osID,
    })),
  );
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const scanAndRecoverCrashedLogs = async () => {
      try {
        const allLogs =
          (await get<AgentExecutionLogType[]>(EXECUTION_LOG_KEY)) || [];

        // Extract any logs that unexpectedly stopped mid-execution
        const crashedLogs = allLogs.filter(
          (log) => log.isLogSavePending && log.jobId,
        );

        if (crashedLogs.length === 0) return;

        const updatedLogs = [...allLogs];

        for (const log of crashedLogs) {
          console.warn(
            `Recovery: Found stranded log data for Job ${log.jobId}. Syncing to server...`,
          );

          try {
            // Push logs and enforce a Failed state to terminate the open job record cleanly
            await updateJobData({
              id: log.jobId,
              machineId: osID,
              flowVersionId: log.versionId,
              status: JobStatusEnum.Failed,
              nodeExecutionLogs: JSON.stringify(log.versionLog),
            });

            // Mark safe locally so we don't pick it up again
            const logIndex = updatedLogs.findIndex(
              (l) => l.jobId === log.jobId,
            );
            if (logIndex !== -1) {
              updatedLogs[logIndex] = {
                ...updatedLogs[logIndex],
                isLogSavePending: false,
              };
            }

            console.log(`Recovery: Job ${log.jobId} sync successful.`);
          } catch (apiErr) {
            console.error(
              `Recovery: Failed to submit payload for job ${log.jobId}:`,
              apiErr,
            );
          }
        }

        // Save the cleaned logs back to IDB
        await set(EXECUTION_LOG_KEY, updatedLogs);
      } catch (err) {
        console.error("Failed to complete IndexedDB crash recovery loop:", err);
      }
    };

    scanAndRecoverCrashedLogs();
  }, []);
};
