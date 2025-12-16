import { HubConnection } from "@microsoft/signalr";
import { useEffect } from "react";

import { JobStatusTypesEnum } from "@/features/orchestrator/executions-table/enums/job-status-type-enum";

import { getJobById, updateJobData } from "../apis/job-trigger-apis";
import { ExecutionCommandTypesEnum } from "../enums/execution-command-types-enum";

import useExecuteFlow from "./useExecuteFlow";

/**
 * useCheckJobTrigger
 *
 * Listens for trigger_agent updates over a WebSocket connection
 * and invoke startExecution to execute agent.
 *
 * @param {HubConnection | null} connection - The SignalR HubConnection instance.
 *
 * @example
 * useCheckJobTrigger(connection);
 */
export default function useCheckJobTrigger(connection: HubConnection | null) {
  const { startExecution, sendCommand, setExecutionState } = useExecuteFlow();

  useEffect(() => {
    // Exit if no connection is provided
    if (!connection) {
      return;
    }

    // Handler for 'trigger_agent' event received from hub
    const handleExecuteFlow = (data: { jobId: string; command: number }) => {
      console.log("trigger_agent received:", data);
      // Lookup to get the enum value from the index
      const commandValue =
        ExecutionCommandTypesEnum[
          data.command as unknown as keyof typeof ExecutionCommandTypesEnum
        ];

      switch (commandValue) {
        case ExecutionCommandTypesEnum.Initiate:
          getJobById(data?.jobId as string)
            .then((data) => {
              updateJobData({
                flowId: data.data.flowId,
                flowVersionId: data.data.flowVersionId,
                id: data.data.id,
                machineId: data.data.machineId,
                status: JobStatusTypesEnum.Running,
              });
            })
            .catch((err) => console.log("Error Fetching Job by Job Id", err));

          break;

        case ExecutionCommandTypesEnum.Execute:
          getJobById(data?.jobId as string)
            .then((data) => {
              startExecution(data.data);
            })
            .catch((err) => console.log("Error Fetching Job by Job Id", err));
          break;

        case ExecutionCommandTypesEnum.Abort:
          {
            localStorage.setItem(
              "conditionalExecutionGroup",
              JSON.stringify([]),
            );
            localStorage.setItem("loopExecutionGroup", JSON.stringify([]));
            setExecutionState("stopped");
            sendCommand("abort");
          }
          break;
        default:
          break;
      }
    };

    // Subscribe to the machine status update event
    connection.on("trigger_agent", handleExecuteFlow);

    // Cleanup listener on component unmount or connection change
    return () => {
      connection.off("trigger_agent", handleExecuteFlow);
    };
  }, [connection, startExecution]);
}
