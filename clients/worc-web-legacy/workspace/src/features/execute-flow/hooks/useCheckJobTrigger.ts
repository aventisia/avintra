import { JobStatusTypesEnum } from "@/features/03-orchestrator/jobs-table/enums/job-status-type-enum";

import { HubConnection } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

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
  const queryClient = useQueryClient();

  const { startExecution, sendCommand, setExecutionState } = useExecuteFlow();

  useEffect(() => {
    if (!connection) return;

    const handleExecuteFlow = async (data: {
      jobId: string;
      command: number;
    }) => {
      // Lookup to get the enum value from the index
      const commandValue = ExecutionCommandTypesEnum[data.command];

      // Log the value of commandValue for debugging
      console.log("trigger_agent received commandValue:", commandValue);

      try {
        if (commandValue === "Initiate") {
          console.log("Initiated exe");
          const jobDataInitiate = await getJobById(data.jobId);

          updateJobData({
            flowVersionId: jobDataInitiate.data.flowVersionId,
            id: jobDataInitiate.data.id,
            machineId: jobDataInitiate.data.machineId,
            status: JobStatusTypesEnum.Running,
          });
        } else if (commandValue === "Execute") {
          console.log("Started exe");
          const jobDataExecute = await getJobById(data.jobId);

          startExecution(jobDataExecute.data);
        } else if (commandValue === "Abort") {
          console.log("Aborted execution");
          localStorage.setItem("conditionalExecutionGroup", JSON.stringify([]));
          localStorage.setItem("loopExecutionGroup", JSON.stringify([]));
          setExecutionState("stopped");
          sendCommand("abort");
        } else {
          console.log("Unknown command received:", commandValue);
        }
      } catch (err) {
        console.error("Error handling job trigger:", err);
      } finally {
        queryClient.invalidateQueries({ queryKey: ["agents-assist"] }); // Assist Agents list
      }
    };

    connection.on("trigger_agent", handleExecuteFlow);

    return () => {
      connection.off("trigger_agent", handleExecuteFlow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);
}
