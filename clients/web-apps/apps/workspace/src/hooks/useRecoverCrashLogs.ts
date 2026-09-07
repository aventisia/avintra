import { get } from "idb-keyval";
import { useEffect, useRef } from "react";

import { JobStatusEnum } from "@/features/03-orchestrator/jobs-table/enums/job-status-enum";
import { AgentExecutionLogType, EXECUTION_LOG_KEY, markLogAsSynced } from "@/features/execute-flow";
import { closeJob } from "@/features/execute-flow/apis/job-trigger-apis";

/**
 * Scans IndexedDB on app boot for unsynced logs from crashed executions,
 * updates the job state to Failed, and posts the accurately consumed credits.
 */
export const useRecoverCrashLogs = (): void => {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const scanAndRecoverCrashedLogs = async () => {
      try {
        const allLogs = (await get<AgentExecutionLogType[]>(EXECUTION_LOG_KEY)) || [];

        // Extract any logs that unexpectedly stopped mid-execution
        const crashedLogs = allLogs.filter(
          (log) => log.isLogSavePending && log.jobId && log.jobId !== "jobId-unknown",
        );

        if (crashedLogs.length === 0) return;

        for (const log of crashedLogs) {
          console.warn(`Recovery: Found stranded log data for Job ${log.jobId}. Syncing...`);

          try {
            // Close the crashed job as Failed. The backend calculates and records consumed credits.
            await closeJob({
              id: log.jobId,
              closingStatus: JobStatusEnum.Failed,
              nodeExecutionLogs: (log.versionLog || []).map((nodeLog) => ({
                nodeExecutionId: nodeLog.nodeExecutionId,
                retryAttempt: nodeLog.retryAttempt,
                nodeId: nodeLog.nodeId,
                nodeDisplayName: nodeLog.nodeName,
                nodeUniqueName: nodeLog.nodeUniqueName,
                isSuccess: nodeLog.isSuccess,
                duration: nodeLog.duration,
                callerReferenceId: nodeLog.callerReferenceId,
                loopReferenceId: nodeLog.loopReferenceId,
                loopIterationIndex: nodeLog.loopIterationIndex,
                inputs: Object.fromEntries(nodeLog.inputs.map((item) => [item.key, item.value])),
                outputs: Object.fromEntries(nodeLog.outputs.map((item) => [item.key, item.value])),
              })),
            });

            // 5. Mark safe locally in IndexedDB so we don't process it again
            await markLogAsSynced(log.jobId);
            console.log(`Recovery: Job ${log.jobId} closed as Failed with logs synced.`);
          } catch (apiErr) {
            console.error(
              `Recovery: Failed to process crash recovery for job ${log.jobId}:`,
              apiErr,
            );
          }
        }
      } catch (err) {
        console.error("Failed to complete IndexedDB crash recovery loop:", err);
      }
    };

    scanAndRecoverCrashedLogs();
  }, []);
};
