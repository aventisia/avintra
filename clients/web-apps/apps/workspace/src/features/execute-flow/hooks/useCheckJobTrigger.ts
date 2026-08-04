import { HubConnection } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getJobById, startJob } from "../apis/job-trigger-apis";
import { ExecutionCommandTypesEnum } from "../enums/execution-command-types-enum";
import useExecuteFlow from "./useExecuteFlow";

export default function useCheckJobTrigger(connection: HubConnection | null) {
  const queryClient = useQueryClient();

  const { startExecution, setExecutionState } = useExecuteFlow();

  useEffect(() => {
    if (!connection) return;

    const handleExecuteFlow = async (data: { jobId: string; command: number }) => {
      const commandValue = ExecutionCommandTypesEnum[data.command];

      try {
        if (commandValue === "Initiate") {
          const jobDataInitiate = await getJobById(data.jobId);
          await startJob({ id: jobDataInitiate.data.id });
        } else if (commandValue === "Execute") {
          const jobDataExecute = await getJobById(data.jobId);
          startExecution(jobDataExecute.data);
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
  }, [connection]);
}
