import { HubConnection } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { startJob } from "../apis/job-trigger-apis";
import { ExecutionCommandTypesEnum } from "../enums/execution-command-types-enum";
import { useCurrentFlowStore } from "../stores/current-flow-store";
import useExecuteFlow from "./useExecuteFlow";

export default function useCheckJobTrigger(connection: HubConnection | null) {
  const queryClient = useQueryClient();

  const { startExecution, setExecutionState } = useExecuteFlow();
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({ currentFlow: state.currentFlow })),
  );

  useEffect(() => {
    if (!connection) return;

    const handleExecuteFlow = async (data: { jobId: string; command: number }) => {
      const commandValue = ExecutionCommandTypesEnum[data.command];

      try {
        if (commandValue === "Initiate") {
          await startJob({ id: data.jobId });
        } else if (commandValue === "Execute") {
          startExecution({
            id: data.jobId,
            flowId: currentFlow.id,
            flowVersionId: currentFlow.versionId,
            name: currentFlow.name,
            machineId: currentFlow.machineId,
            status: "Running",
            inputOutputObject: currentFlow.inputOutputObject,
          });
        } else if (commandValue === "Abort") {
          setExecutionState("stopped");
        }
      } catch (err) {
        console.error("Error handling job trigger:", err);
      } finally {
        queryClient.invalidateQueries({ queryKey: ["agents-assist"] });
      }
    };

    connection.on("trigger_agent", handleExecuteFlow);

    return () => {
      connection.off("trigger_agent", handleExecuteFlow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    connection,
    currentFlow.id,
    currentFlow.versionId,
    currentFlow.name,
    currentFlow.machineId,
    currentFlow.inputOutputObject,
  ]);
}
