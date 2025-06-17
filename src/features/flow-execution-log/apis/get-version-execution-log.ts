import { AgentExecutionLogType } from "@/features/execute-flow/types/execution-log-types";
import {
  Execution,
  ExecutionNode,
} from "@/features/flow-execution-log/types/execution-types";

export const getLocalExecutionLog = async (versionId: string) => {
  try {
    const logsJson = localStorage.getItem("executionLog");
    if (!logsJson) return null;

    const logs: AgentExecutionLogType[] = logsJson ? JSON.parse(logsJson) : [];

    const versionLog = logs.find((log) => log.versionId === versionId);

    if (!versionLog) return null;

    return [
      {
        executionId: "debug",
        number: "debug",
        isSuccess: false,
        executedOn: new Date().toISOString(),
        duration: 0,
        nodes: versionLog.versionLog as ExecutionNode[],
      },
    ] as Execution[];
  } catch {
    console.log(
      "Unable to load agent execution logs from local storage. Please try again.",
    );
    return null;
  }
};
