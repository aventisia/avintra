import { get, set, update } from "idb-keyval";

import {
  AgentExecutionLogType,
  CURRENT_JOB_ID_KEY,
  CURRENT_VERSION_ID_KEY,
  EXECUTION_LOG_KEY,
  NodeExecutionLogType,
} from "..";

export async function saveNodeExecutionLog(nodeLog: string): Promise<void> {
  let nodeLogParsed: NodeExecutionLogType;

  try {
    nodeLogParsed = JSON.parse(nodeLog) as NodeExecutionLogType;
  } catch {
    console.error("Invalid node execution log payload.");
    return;
  }

  const versionId =
    localStorage.getItem(CURRENT_VERSION_ID_KEY) || "versionId-unknown";

  const jobId = localStorage.getItem(CURRENT_JOB_ID_KEY) || "jobId-unknown";

  // Use update to avoid lost writes when multiple node logs arrive close together.
  await update(EXECUTION_LOG_KEY, (value) => {
    const logs = Array.isArray(value)
      ? [...(value as AgentExecutionLogType[])]
      : [];
    const index = logs.findIndex((log) => log.versionId === versionId);

    if (index >= 0) {
      logs[index] = {
        ...logs[index],
        versionLog: [...logs[index].versionLog, nodeLogParsed],
      };
    } else {
      logs.push({
        versionId,
        jobId,
        isLogSavePending: true,
        versionLog: [nodeLogParsed],
      });
    }

    return logs;
  });
}

export async function clearNodeExecutionLog(): Promise<void> {
  // Get current versionId from localStorage
  const currentVersionId =
    localStorage.getItem(CURRENT_VERSION_ID_KEY) || "versionId-unknown";

  // Retrieve existing logs from IndexedDB
  const logs = (await get<AgentExecutionLogType[]>(EXECUTION_LOG_KEY)) || [];

  // Filter out the log for the given versionId and job id
  const updatedLogs = logs.filter((log) => log.versionId !== currentVersionId);

  // Save back to IndexedDB
  await set(EXECUTION_LOG_KEY, updatedLogs);
}

/**
 * Flips the pending status to false once the backend database successfully updates.
 */
export const markLogAsSynced = async (jobId: string): Promise<void> => {
  const logs = (await get<AgentExecutionLogType[]>(EXECUTION_LOG_KEY)) || [];

  const logIndex = logs.findIndex((log) => log.jobId === jobId);

  if (logIndex === -1) return;

  logs[logIndex] = {
    ...logs[logIndex],
    isLogSavePending: false,
  };

  await set(EXECUTION_LOG_KEY, logs);
};
