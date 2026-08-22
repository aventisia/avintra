import { getMySession } from "@avplatform/ui/apis";
import { Button } from "@avplatform/ui/buttons";
import { IS_TAURI } from "@avplatform/ui/constants";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { Node } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { getAvailableCredits } from "@/features/available-credits/available-credits-apis";
import { AC_QUERY_KEY } from "@/features/available-credits/available-credits-constants";
import { useSaveFlow } from "@/features/react-flow/hooks/useSaveFlow";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";

import {
  doesFlowContainAnyDesktopOnlyNode,
  isEmptyFlow,
  isValidFlowGraph,
  useExecuteFlowMutation,
  useJobNotifications,
} from "..";
import { insertJob } from "../apis/jobs-table-apis";
import { abortJobExecution } from "../apis/jobs-table-apis";
import { JobStatusEnum } from "../enums/job-status-enum";
import { useLocalExecutionWebSocket } from "../hooks/useLocalExecutionWebSocket";
import { useRunResultsQueryParams } from "../hooks/useRunResultsQueryParams";
import { useJobDataStore } from "../stores/job-data-store";
import { useLiveExecutionStore } from "../stores/live-execution-store";
import { clearExecutionLogForVersion } from "../utils/save-node-execution-log";

const ExecuteFlow = () => {
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { currentFlow, isFlowLoading, executionState, setCurrentFlow, setExecutionState } =
    useCurrentFlowStore(
      useShallow((state) => ({
        currentFlow: state.currentFlow,
        isFlowLoading: state.isFlowLoading,
        executionState: state.executionState,
        setCurrentFlow: state.setCurrentFlow,
        setExecutionState: state.setExecutionState,
      })),
    );

  const { updateField } = useJobDataStore(
    useShallow((state) => ({
      updateField: state.updateField,
    })),
  );

  const { nodes, edges, flowType } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      flowType: state.flowType,
    })),
  );

  const { isPending: isSaving, saveData, isSavePending } = useSaveFlow();
  const { executeFlowOnWebMutationAsync } = useExecuteFlowMutation();
  const { setShowRunResults, setJobId, setRunVersionId } = useRunResultsQueryParams();

  // Live local (desktop) execution progress: subscribes to the Tauri WebSocket whenever a
  // job is active and dispatches per-node status into the live-execution store. No-op in
  // plain-browser / server mode (only opens a socket once jobId is set).
  const { sendControl } = useLocalExecutionWebSocket();

  // Connect to SignalR hub for real-time job notifications
  useJobNotifications(
    (notification) => {
      if (notification.status === "Completed" && flowType !== FlowTypesEnum.ChatAgent) {
        toast.success(notification.message || "Flow execution completed successfully!");
        setExecutionState("stopped");
        setShowRunResults(true);
      } else if (notification.status === "Failed") {
        toast.error(notification.message || "Flow execution failed.");
        setExecutionState("stopped");
        setShowRunResults(true);
      } else if (notification.status === "Abort") {
        toast.info(notification.message || "Flow execution was aborted.");
        setExecutionState("stopped");
        setShowRunResults(true);
      }
      queryClient.invalidateQueries({ queryKey: ["AGENT_JOB_EXECUTION"] });
      // Credits are consumed server-side when the job finishes; refresh the
      // header balance so it updates without needing a manual page reload.
      queryClient.invalidateQueries({ queryKey: AC_QUERY_KEY });
    },
    (notification) => {
      console.log("Job progress:", notification);
    },
  );

  const isCommercial = userSession?.deploymentType == "Commercial";
  const isEnterprise = userSession?.deploymentType == "Enterprise";
  const hasActivePlan = userSession?.planType == "Active";

  const abortExecution = async () => {
    if (!currentFlow?.jobId) {
      setExecutionState("stopped");
      return;
    }

    // Local (desktop) runs are controlled over the Tauri WebSocket: the RunnerApp owns the
    // terminal status (CloseJob(Aborted)). Server/web runs abort via the backend API.
    if (IS_TAURI) {
      sendControl("abort");
    }

    try {
      await abortJobExecution(currentFlow.jobId);
      setExecutionState("stopped");
      setShowRunResults(true);
      toast.warning("Execution has been aborted");
    } catch (error) {
      console.error("Failed to abort execution:", error);
      toast.error(`Failed to abort execution: ${error}`);
    }
  };

  const startExecution = async () => {
    if (executionState === "executing" || executionState === "launching-executor") {
      return;
    }

    setIsStarting(true);
    try {
      if (currentFlow?.isArchived) {
        toast.info("Archived flows cannot be executed.");
        return;
      }

      if (currentFlow?.isPublished) {
        toast.info("Published agents can only be executed via the Orchestrator.");
        return;
      }

      if (isSavePending) {
        const saved = await saveData();
        if (!saved) return;
      }

      if (isEmptyFlow(nodes as Node<NodeDataType>[])) {
        toast.error("Flow is empty and cannot be executed.");
        return;
      }

      let isDesktopOnlyFlow = doesFlowContainAnyDesktopOnlyNode(nodes as Node<NodeDataType>[]);
      if (IS_TAURI) isDesktopOnlyFlow = true;

      // if (!IS_TAURI && isDesktopOnlyFlow) {
      //   toast.error("Flow contains desktop nodes which cannot be executed via web.");
      //   return;
      // }

      const flowGraphError = isValidFlowGraph(nodes as Node<NodeDataType>[], edges);
      if (flowGraphError) {
        toast.error(`Flow graph is invalid: ${flowGraphError}`);
        return;
      }

      if (isCommercial) {
        const creditsData = await getAvailableCredits();
        if (creditsData?.data && creditsData.data.availableCredits < 10) {
          toast.error("Insufficient credits. Please top up to continue.");
          return;
        }
      }

      if (isEnterprise && !hasActivePlan) {
        toast.error(
          "This action is currently unavailable. Please contact your administrator or support.",
        );
        return;
      }

      setExecutionState("launching-executor");

      const userSession = await getMySession();
      if (!userSession) return;

      if (isDesktopOnlyFlow) {
        const executionStartTime = new Date();
        const jobRes = await insertJob({
          flowId: currentFlow.id,
          flowVersionId: currentFlow.versionId,
          duration: 0,
          status: JobStatusEnum.Running,
          startTime: executionStartTime,
          isPublished: false,
        });

        // Reset the live-execution map and wipe the previous run's persisted logs for
        // this flow BEFORE showing the run-results panel, so CanvasNodeDetailPanel's
        // restore effect does not immediately re-apply stale green/failed colors.
        useLiveExecutionStore.getState().resetLiveExecution();
        if (currentFlow.versionId) {
          await clearExecutionLogForVersion(currentFlow.versionId);
        }

        setCurrentFlow({
          ...currentFlow,
          jobId: jobRes.data.id,
          runVersionId: currentFlow.versionId,
        });
        setJobId(jobRes.data.id);
        setRunVersionId(currentFlow.versionId);
        setShowRunResults(true);
        updateField("startTime", executionStartTime);

        // Launch the runner app as a sidecar to run the flow on this machine.
        // The runner is provisioned (downloaded/updated) when the desktop app
        // opens, so we only launch it here rather than re-checking it.
        // RunnerApp reads its own machine identity, so we only pass the URL,
        // job id, and access token.
        if (IS_TAURI) {
          try {
            await invoke("launch_runner_app", {
              appBaseUrl: `${window.location.origin}`,
              jobId: jobRes.data.id,
              accessToken: userSession.data?.accessToken,
            });
          } catch (error) {
            console.error("Failed to launch the executor:", error);
            toast.error(`Failed to launch the executor. Please try again. Error: ${error}`);
            setExecutionState("stopped");
            return;
          }
        }

        setExecutionState("executing");
      } else {
        try {
          await executeFlowOnWebMutationAsync({ flowVersionId: currentFlow.versionId });
        } catch {
          setExecutionState("stopped");
          return;
        }
      }
    } finally {
      setIsStarting(false);
    }
  };

  if (isFlowLoading || flowType === FlowTypesEnum.ChatAgent) {
    return null;
  }

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
            disabled={isSaving}
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
