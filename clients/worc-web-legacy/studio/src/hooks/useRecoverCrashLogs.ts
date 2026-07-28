import { get } from "idb-keyval";
import { useEffect, useRef } from "react";

import { ActionTypesEnum } from "@/features/credits-management/constants/action-types-enum";
import { CreditServicesEnum } from "@/features/credits-management/constants/credit-service-type-enum";
import { UsageSourceTypesEnum } from "@/features/credits-management/constants/usage-source-types-enum";
import { usePostCreditConsumptionMutation } from "@/features/credits-management/hooks/usePostCreditConsumptionMutation";
import { AgentExecutionLogType, EXECUTION_LOG_KEY, markLogAsSynced } from "@/features/execute-flow";
import { getJobById, updateJobData } from "@/features/execute-flow/apis/jobs-table-apis";
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
            // 1. Fetch original job details from server
            const jobResponse = await getJobById(log.jobId);
            const jobData = jobResponse?.data;

            if (!jobData) {
              console.warn(`Recovery: Could not find job data on server for Job ${log.jobId}`);
              continue;
            }

            const startTime = jobData.startTime ? new Date(jobData.startTime) : new Date();

            // 2. Calculate true execution duration by summing up the durations of completed nodes
            const totalNodeDuration = (log.versionLog || []).reduce(
              (acc, node) => acc + (node.duration || 0),
              0,
            );

            // Ensure a minimum of 1 second duration even if it crashed instantly
            const duration = Math.max(1, totalNodeDuration);

            // Calculate the exact end time based on the start time and node execution sum
            const endTime = new Date(startTime.getTime() + duration * 1000);

            // 3. Push final logs and update status to Failed
            await updateJobData({
              id: log.jobId,
              flowId: jobData.flowId,
              flowVersionId: log.versionId,
              machineId: jobData.machineId,
              duration,
              status: JobStatusEnum.Failed,
              startTime,
              endTime,
              nodeExecutionLogs: JSON.stringify(log.versionLog || []),
            });

            // 4. Post credit consumption for the actual elapsed execution time
            await postCreditConsumption([
              {
                serviceType: CreditServicesEnum[CreditServicesEnum.AgentExecutionTime],
                consumedUnit: duration,
                refType: UsageSourceTypesEnum[UsageSourceTypesEnum.Agent],
                refId: jobData.flowId || "",
                refName: jobData.name || "Agent",
                action: ActionTypesEnum[ActionTypesEnum.AgentExecution],
                triggeredByAgent: jobData.name || "Agent",
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
