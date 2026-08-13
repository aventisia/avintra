import { get } from "idb-keyval";

import { AgentExecutionLogType } from "@/features/execute-flow/types/execution-log-types";

import { EXECUTION_LOG_KEY } from "..";
import { Execution, ExecutionNode } from "../types/execution-types";

export const getLocalExecutionLog = async (versionId: string) => {
  try {
    const logs = (await get<AgentExecutionLogType[]>(EXECUTION_LOG_KEY)) || [];

    const versionLog = logs.find((log) => log.versionId === versionId);

    if (!versionLog) return null;

    return [
      {
        executionId: "debug",
        number: "debug",
        isSuccess: versionLog.isSuccess ?? false,
        executedOn: versionLog.executedOn ?? new Date().toISOString(),
        duration: 0,
        nodes: versionLog.versionLog.map((nodeLog): ExecutionNode => ({
          nodeExecutionId: nodeLog.nodeExecutionId,
          retryAttempt: nodeLog.retryAttempt,
          nodeId: nodeLog.nodeId,
          nodeName: nodeLog.nodeName,
          isSuccess: nodeLog.isSuccess,
          duration: nodeLog.duration,
          nodeUniqueName: nodeLog.nodeUniqueName,
          inputs: Object.fromEntries(nodeLog.inputs.map((input) => [input.key, input.value])),
          outputs: Object.fromEntries(nodeLog.outputs.map((output) => [output.key, output.value])),
        })),
      },
    ] as Execution[];
  } catch {
    console.log("Unable to load agent execution logs from local storage. Please try again.");
    return null;
  }
};
