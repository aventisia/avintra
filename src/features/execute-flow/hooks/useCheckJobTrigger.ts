import { HubConnection } from "@microsoft/signalr";
import { useEffect } from "react";

import { getJobById } from "../apis/job-trigger-apis";

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
  const { startExecution } = useExecuteFlow();

  useEffect(() => {
    // Exit if no connection is provided
    if (!connection) {
      return;
    }

    // Handler for 'trigger_agent' event received from hub
    const handleExecuteFlow = (data: { jobId: string }) => {
      console.log("trigger_agent received:", data);
      getJobById(data?.jobId as string)
        .then((data) => {
          startExecution(data.data);
        })
        .catch((err) => console.log("Error Fetching Job by Job Id", err));
    };

    // Subscribe to the machine status update event
    connection.on("trigger_agent", handleExecuteFlow);

    // Cleanup listener on component unmount or connection change
    return () => {
      connection.off("trigger_agent", handleExecuteFlow);
    };
  }, [connection, startExecution]);
}
