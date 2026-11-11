import { get } from "idb-keyval";
import { useEffect, useRef } from "react";

import { ActionTypesEnum } from "@/features/credits-management/constants/action-types-enum.ee";
import { CreditServicesEnum } from "@/features/credits-management/constants/credit-service-type-enum.ee";
import { UsageSourceTypesEnum } from "@/features/credits-management/constants/usage-source-types-enum.ee";
import { usePostCreditConsumptionMutation } from "@/features/credits-management/hooks/usePostCreditConsumptionMutation.ee";
import { AgentExecutionLogType, EXECUTION_LOG_KEY, markLogAsSynced } from "@/features/execute-flow";
import { updateJobData } from "@/features/execute-flow/apis/jobs-table-apis";
import { insertNodeExecutionLogs } from "@/features/execute-flow/apis/node-execution-log-apis";
import { NodeExecutionLogDto } from "@/features/execute-flow/dtos/node-execution-log-dto";
import { JobStatusEnum } from "@/features/execute-flow/enums/job-status-enum";

/**
 * Scans IndexedDB on app boot for unsynced logs from crashed executions,
 * updates the job state to Failed, and posts the accurately consumed credits.
 */
export const useRecoverCrashLogs = (): void => {
  const hasRun = useRef(false);
  const { postCreditConsumption } = usePostCreditConsumptionMutation();

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
            // 1. Calculate true execution duration by summing up the durations of completed nodes
            const totalNodeDuration = (log.versionLog || []).reduce(
              (acc, node) => acc + (node.duration || 0),
              0,
            );

            // Ensure a minimum of 1 second duration even if it crashed instantly
            const duration = Math.max(1, totalNodeDuration);

            // Approximate start/end times locally; the backend already has the real start time.
            const endTime = new Date();
            const startTime = new Date(endTime.getTime() - duration * 1000);

            // 2. Push final logs and update status to Failed
            await updateJobData({
              id: log.jobId,
              flowVersionId: log.versionId,
              duration,
              status: JobStatusEnum.Failed,
              startTime,
              endTime,
            });

            // 3.1 Sync any captured node execution logs separately.
            const nodeLogs = (log.versionLog || []).map((nodeLog): NodeExecutionLogDto => ({
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
            }));

            if (nodeLogs.length > 0) {
              await insertNodeExecutionLogs(log.jobId, nodeLogs);
            }

            // 4. Post credit consumption for the actual elapsed execution time
            await postCreditConsumption([
              {
                serviceType: CreditServicesEnum[CreditServicesEnum.AgentExecutionTime],
                consumedUnit: duration,
                refType: UsageSourceTypesEnum[UsageSourceTypesEnum.Agent],
                refId: "",
                refName: "Agent",
                action: ActionTypesEnum[ActionTypesEnum.AgentExecution],
                triggeredByAgent: "Agent",
              },
            ]);

            // 5. Mark safe locally in IndexedDB so we don't process it again
            await markLogAsSynced(log.jobId);
            console.log(
              `Recovery: Job ${log.jobId} sync & credit update successful (Duration: ${duration}s).`,
            );
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
  }, [postCreditConsumption]);
};
