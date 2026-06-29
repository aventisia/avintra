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
        isSuccess: false,
        executedOn: new Date().toISOString(),
        duration: 0,
        nodes: versionLog.versionLog.map(
          (nodeLog): ExecutionNode => ({
            nodeExecutionId: nodeLog.nodeExecutionId,
            retryAttempt: nodeLog.retryAttempt,
            nodeId: nodeLog.nodeId,
            nodeName: nodeLog.nodeName,
            isSuccess: nodeLog.isSuccess,
            duration: nodeLog.duration,
            nodeUniqueName: nodeLog.nodeUniqueName,
            // Assign a unique ID to distinguish repeated instances of the same node (when used inside a loop)
            // TODO: this may not be required anymore since we have added nodeExecutionId and retryAttempt to the ExecutionNode type
            // which together forms unique identifier for a node execution. We can remove this in future if we don't need it.
            uniqueNodeId: window.crypto.randomUUID(),

            inputs: Object.fromEntries(
              nodeLog.inputs.map((input) => [input.key, input.value]),
            ),
            outputs: Object.fromEntries(
              nodeLog.outputs.map((output) => [output.key, output.value]),
            ),
          }),
        ),
      },
    ] as Execution[];
  } catch {
    console.log(
      "Unable to load agent execution logs from local storage. Please try again.",
    );
    return null;
  }
};
