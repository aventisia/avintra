import {
  AgentExecutionLogType,
  CURRENT_VERSION_ID_KEY,
  EXECUTION_LOG_KEY,
  NodeExecutionLogType,
} from "..";

export function saveNodeExecutionLog(nodeLog: NodeExecutionLogType): void {
  // Get existing logs from localStorage
  const logsJson = localStorage.getItem(EXECUTION_LOG_KEY);

  // Get versionId from localStorage
  const versionId =
    localStorage.getItem(CURRENT_VERSION_ID_KEY) || "versionId-unknown";

  // Parse the logs or initialize an empty array if not found
  const logs: AgentExecutionLogType[] = logsJson ? JSON.parse(logsJson) : [];

  // Find the log for the given versionId
  const versionLog = logs.find((log) => log.versionId === versionId);

  // If the version log exists, push the new node log; otherwise, create a new entry
  if (versionLog) {
    versionLog.versionLog.push(nodeLog);
  } else {
    logs.push({
      versionId,
      versionLog: [nodeLog],
    });
  }

  // Save back to localStorage
  localStorage.setItem(EXECUTION_LOG_KEY, JSON.stringify(logs));
}
