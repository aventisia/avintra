import { HubConnection } from "@microsoft/signalr";
import { useEffect } from "react";

import { getJobById } from "../apis/job-trigger-apis";
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
      // Reverse lookup to get the enum value from the index
      const commandValue =
        ExecutionCommandTypesEnum[
          data.command as unknown as keyof typeof ExecutionCommandTypesEnum
        ];

      if (commandValue == ExecutionCommandTypesEnum.Execute)
        getJobById(data?.jobId as string)
          .then((data) => {
            startExecution(data.data);
          })
          .catch((err) => console.log("Error Fetching Job by Job Id", err));
      else if (commandValue == ExecutionCommandTypesEnum.Abort) {
        sendCommand("abort");
        setExecutionState("stopped");
      }
    };

    // Subscribe to the machine status update event
    connection.on("trigger_agent", handleExecuteFlow);

    // Cleanup listener on component unmount or connection change
    return () => {
      connection.off("trigger_agent", handleExecuteFlow);
    };
  }, [connection, sendCommand, setExecutionState, startExecution]);
}
