import { Button } from "@avplatform/ui/buttons";
import { toast } from "@avplatform/ui/sonner";
import { Tooltip } from "@avplatform/ui/tooltip";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { getAvailableCredits } from "@/features/available-credits/available-credits-apis";

import { abortJobExecution, startJob } from "../apis/job-trigger-apis";
import { useCurrentFlowStore } from "../stores/current-flow-store";
import { useJobDataStore } from "../stores/job-data-store";

const ExecuteFlow = ({ versionId }: { versionId: string; agentId: string }) => {
  const [isStarting, setIsStarting] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);

  const { executionState, setExecutionState, currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      executionState: state.executionState,
      setExecutionState: state.setExecutionState,
      currentFlow: state.currentFlow,
    })),
  );

  const { updateField } = useJobDataStore(
    useShallow((state) => ({
      updateField: state.updateField,
    })),
  );

  const isCommercial = false;

  // Connect to SignalR hub for job notifications
  useEffect(() => {
    let isMounted = true;

    const connect = async () => {
      const hubUrl = `${import.meta.env.VITE_WORKSPACE_API_PATH}/hubs/flow-execution`;

      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl, { withCredentials: true })
        .withAutomaticReconnect({ nextRetryDelayInMilliseconds: () => 5000 })
        .configureLogging(LogLevel.Information)
        .build();

      connectionRef.current = connection;

      connection.on(
        "JobCompleted",
        (notification: { jobId: string; status: string; message?: string }) => {
          if (!isMounted) return;
          if (notification.jobId !== currentFlow.jobId) return;

          if (notification.status === "Completed") {
            toast.success(notification.message || "Execution completed successfully.");
            setExecutionState("stopped");
          } else if (notification.status === "Failed") {
            toast.error(notification.message || "Execution failed.");
            setExecutionState("stopped");
          } else if (notification.status === "Aborted" || notification.status === "Abort") {
            toast.info(notification.message || "Execution was aborted.");
            setExecutionState("stopped");
          }
        },
      );

      connection.on(
        "JobProgress",
        (notification: { jobId: string; status: string; message?: string }) => {
          if (!isMounted) return;
          if (notification.jobId !== currentFlow.jobId) return;
          console.log("Job progress:", notification);
        },
      );

      try {
        await connection.start();
      } catch {
        // SignalR connection failure is non-fatal; execution still works via polling
      }
    };

    connect();

    return () => {
      isMounted = false;
      connectionRef.current?.stop();
    };
  }, [currentFlow.jobId, setExecutionState]);

  const startExecution = useCallback(async () => {
    if (executionState === "executing" || executionState === "launching-executor") {
      return;
    }

    if (isCommercial) {
      const creditsData = await getAvailableCredits();
      if (creditsData?.data && creditsData.data.availableCredits < 10) {
        toast.error("Insufficient credits. Please top up to continue.");
        return;
      }
    }

    setIsStarting(true);
    setExecutionState("launching-executor");

    try {
      const startTime = new Date();
      updateField("startTime", startTime);

      await startJob({ id: currentFlow.jobId || versionId });

      setExecutionState("executing");
    } catch (error) {
      toast.error(`Failed to start execution: ${error}`);
      setExecutionState("stopped");
    } finally {
      setIsStarting(false);
    }
  }, [executionState, isCommercial, currentFlow.jobId, versionId, setExecutionState, updateField]);

  const abortExecution = useCallback(async () => {
    try {
      await abortJobExecution(currentFlow.jobId || versionId);
      setExecutionState("stopped");
      toast.warning("Execution has been aborted");
    } catch (error) {
      console.error("Failed to abort execution:", error);
    }
  }, [currentFlow.jobId, versionId, setExecutionState]);

  return (
    <div className="flex items-center gap-2">
      {executionState === "executing" || executionState === "paused" ? (
        <div className="group flex h-8 gap-1 rounded-lg bg-white/10">
          <Tooltip content="Abort">
            <Button
              variant="ghost"
              size="icon8"
              className="hover:bg-white/10"
              onClick={abortExecution}
            >
              <StopIcon className="h-[1.1rem] w-[1.1rem] text-red-500/80" />
            </Button>
          </Tooltip>
        </div>
      ) : (
        <Tooltip content="Execute">
          <Button
            variant="ghost"
            size="icon8"
            className="hover:bg-white/10"
            onClick={startExecution}
          >
            {isStarting || executionState === "launching-executor" ? (
              <Loader2 className="h-[1.1rem] w-[1.1rem] animate-spin text-white/80" />
            ) : (
              <PlayIcon className="h-[1.1rem] w-[1.1rem] text-green-500/80" />
            )}
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export { ExecuteFlow };
