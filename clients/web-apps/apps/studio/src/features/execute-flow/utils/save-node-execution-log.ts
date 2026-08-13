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

  const versionId = localStorage.getItem(CURRENT_VERSION_ID_KEY) || "versionId-unknown";

  const jobId = localStorage.getItem(CURRENT_JOB_ID_KEY) || "jobId-unknown";

  await appendNodeExecutionLog(versionId, jobId, nodeLogParsed);
}

/**
 * Appends a node execution log to the IndexedDB store for the given version/job, bypassing
 * localStorage keys (which the Studio app never sets). Used by the local (desktop) execution
 * path to persist per-node results for refresh recovery.
 */
export async function appendNodeExecutionLog(
  versionId: string,
  jobId: string,
  nodeLog: NodeExecutionLogType,
): Promise<void> {
  // Use update to avoid lost writes when multiple node logs arrive close together.
  await update(EXECUTION_LOG_KEY, (value) => {
    const logs = Array.isArray(value) ? [...(value as AgentExecutionLogType[])] : [];
    const index = logs.findIndex((log) => log.versionId === versionId);

    if (index >= 0) {
      logs[index] = {
        ...logs[index],
        versionLog: [...logs[index].versionLog, nodeLog],
      };
    } else {
      logs.push({
        versionId,
        jobId,
        isLogSavePending: true,
        versionLog: [nodeLog],
      });
    }

    return logs;
  });
}

/**
 * Replaces the whole IndexedDB execution log entry for a version with a single completed run.
 * Used by the local (desktop) execution path once a job reaches a terminal state, so a refresh
 * with the run-results flag can restore the exact colored canvas and job status.
 */
export async function saveCompletedExecutionLog(
  versionId: string,
  jobId: string,
  nodeLogs: NodeExecutionLogType[],
  isSuccess: boolean,
): Promise<void> {
  await update(EXECUTION_LOG_KEY, (value) => {
    const logs = Array.isArray(value) ? [...(value as AgentExecutionLogType[])] : [];
    const index = logs.findIndex((log) => log.versionId === versionId);

    const entry: AgentExecutionLogType = {
      versionId,
      jobId,
      isLogSavePending: false,
      isSuccess,
      executedOn: new Date().toISOString(),
      versionLog: nodeLogs,
    };

    if (index >= 0) {
      logs[index] = entry;
    } else {
      logs.push(entry);
    }

    return logs;
  });
}

export async function clearNodeExecutionLog(): Promise<void> {
  // Get current versionId from localStorage
  const currentVersionId = localStorage.getItem(CURRENT_VERSION_ID_KEY) || "versionId-unknown";

  await clearExecutionLogForVersion(currentVersionId);
}

/**
 * Removes the IndexedDB execution log entry for a specific version id. Used by the local
 * (desktop) "Clear Results" action to wipe persisted run results for the current flow.
 */
export async function clearExecutionLogForVersion(versionId: string): Promise<void> {
  // Retrieve existing logs from IndexedDB
  const logs = (await get<AgentExecutionLogType[]>(EXECUTION_LOG_KEY)) || [];

  // Filter out the log for the given versionId
  const updatedLogs = logs.filter((log) => log.versionId !== versionId);

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
