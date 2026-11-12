import { getMySession } from "@avplatform/ui/apis";
import { Button } from "@avplatform/ui/buttons";
import { IS_TAURI } from "@avplatform/ui/constants";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { CircleNotchIcon, InfoIcon, PlayIcon, SquareIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { Node } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { AC_QUERY_KEY } from "@/features/available-credits/available-credits-constants.ee";
import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
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
import { getExecutionEntitlementError } from "./ExecuteFlow.ee";

const ExecuteFlow = () => {
  const [isStarting, setIsStarting] = useState<boolean>(false);
  // True while an abort is in-flight: the abort button turns into a spinner and is disabled
  // so the user cannot click stop multiple times during the gap between clicking and the
  // runner actually stopping. Cleared once the run reaches a terminal state.
  const [isAborting, setIsAborting] = useState<boolean>(false);
  // Elapsed execution time (seconds) shown next to the stop button. Client-side only:
  // ticks while `executionState` is "executing", freezes while "paused", and holds its
  // final value when a run ends so the user can read it. Reset on each new run.
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  // Timestamp the current run started ticking (set at the "executing" transition).
  const executionStartRef = useRef<number>(0);
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

  const { isPending: isSaving, saveData } = useSaveFlow();
  const { executeFlowOnWebMutationAsync } = useExecuteFlowMutation();
  const { showRunResults, setShowRunResults, setRunContext } = useRunResultsQueryParams();

  // Live local (desktop) execution progress: subscribes to the Tauri WebSocket whenever a
  // job is active and dispatches per-node status into the live-execution store. No-op in
  // plain-browser / server mode (only opens a socket once jobId is set).
  const { sendControl } = useLocalExecutionWebSocket();

  // Clear the abort in-flight flag once the run reaches a terminal state (the abort button
  // returns to the stop icon then). This is driven by the same notification/jobCompleted
  // that flips executionState to "stopped", so the spinner stays until the runner finishes.
  useEffect(() => {
    if (executionState === "stopped") {
      setIsAborting(false);
    }
  }, [executionState]);

  // Tick the elapsed while a run is actively executing. The interval only runs
  // when `executionState === "executing"`; while "paused" the clock holds (Q5) and when
  // the state leaves "executing" (stopped/completed/aborted) the effect clears the
  // interval, leaving the last elapsed value frozen on screen.
  useEffect(() => {
    if (executionState !== "executing") return;

    executionStartRef.current = executionStartRef.current || Date.now();
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - executionStartRef.current) / 1000));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [executionState]);

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

  const { deploymentType, planType } = userSession ?? {};

  const abortExecution = async () => {
    if (!currentFlow?.jobId) {
      setExecutionState("stopped");
      setIsAborting(false);
      return;
    }

    // Show a loading indicator immediately so the user can't click stop repeatedly while
    // the runner is shutting down (there's a gap of a few seconds before it closes).
    setIsAborting(true);

    // Step 1: tell the local RunnerApp to stop the flow over the Tauri WebSocket. We do
    // NOT call abortJobExecution() (which would mark the job terminal on the backend and
    // make the runner's own CloseJobAsync fail with "already terminal" — losing credit
    // tracking). Instead we let the runner run to completion and close the job itself via
    // CloseJobAsync (which records end time and consumed credits). The runner pushes a
    // `jobCompleted` message over the WS once it closes the job, which flips
    // executionState to "stopped", stops the timer, and clears isAborting — so the
    // spinner stays up until the runner finishes.
    if (IS_TAURI) {
      sendControl("abort");
    } else {
      // Web / server runs abort via the backend API.
      try {
        await abortJobExecution(currentFlow.jobId);
        setExecutionState("stopped");
        setShowRunResults(true);
        toast.warning("Execution has been aborted");
      } catch (error) {
        console.error("Failed to abort execution:", error);
        toast.error(`Failed to abort execution: ${error}`);
        setIsAborting(false);
      }
    }
  };

  const startExecution = async () => {
    if (executionState === "executing" || executionState === "launching-executor") {
      return;
    }

    // Reset the execution timer for the new run (Q4).
    setElapsedSeconds(0);
    executionStartRef.current = 0;

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

      // Commit pending config-form edits, then persist the canvas before
      // running. The flush always persists, including incomplete/invalid edits,
      // so the user's mid-edit state is not lost.
      await useDynamicConfigPanelStore.getState().flushForm?.();
      const saved = await saveData();
      if (!saved) return;

      if (isEmptyFlow(nodes as Node<NodeDataType>[])) {
        toast.error("Flow is empty and cannot be executed.");
        return;
      }

      let isDesktopOnlyFlow = doesFlowContainAnyDesktopOnlyNode(nodes as Node<NodeDataType>[]);
      if (IS_TAURI) isDesktopOnlyFlow = true;

      if (!IS_TAURI && isDesktopOnlyFlow) {
        toast.error("Flow contains desktop nodes which cannot be executed via web.");
        return;
      }

      const flowGraphError = isValidFlowGraph(nodes as Node<NodeDataType>[], edges);
      if (flowGraphError) {
        toast.error(`Flow graph is invalid: ${flowGraphError}`);
        return;
      }

      const entitlementError = await getExecutionEntitlementError(deploymentType, planType);
      if (entitlementError) {
        toast.error(entitlementError);
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
          runFlowId: currentFlow.id,
        });
        // Set the whole run context atomically so `j`, `rv`, `rf` and `showRunResults` are
        // all present in the URL immediately (not only after completion). This lets sub-flow
        // navigation retain the live execution log while the run is still in progress.
        setRunContext({
          jobId: jobRes.data.id,
          runVersionId: currentFlow.versionId,
          runFlowId: currentFlow.id,
          showRunResults: true,
        });
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
        executionStartRef.current = Date.now();
      } else {
        try {
          await executeFlowOnWebMutationAsync({ flowVersionId: currentFlow.versionId });
          setExecutionState("executing");
          executionStartRef.current = Date.now();
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

  // Format the elapsed seconds as MM:SS, auto-promoting to HH:MM:SS past 60 minutes (Q6).
  const formatElapsed = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return hours > 0 ? `${String(hours).padStart(2, "0")}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Timer: visible while a run is active (ticks) and after it ends (frozen) so the
          elapsed time stays readable until Clear Results or a new execution. */}
      {executionState === "executing" || executionState === "paused" || showRunResults ? (
        <div className="flex h-7 items-center gap-1 rounded-md border border-line bg-sunken pl-2.5 pr-1">
          <span className="flex items-center font-mono text-[12.5px] font-medium tabular-nums text-ink-2">
            {formatElapsed(elapsedSeconds)}
          </span>
          <Tooltip content="This timer tracks the elapsed time on your device while the flow is running. The duration shown in the execution logs and jobs may differ slightly as it is calculated by the server.">
            <span className="flex size-5 cursor-help items-center justify-center rounded-sm text-muted-foreground hover:bg-hover">
              <InfoIcon className="size-3.5 -mt-[1px]" />
            </span>
          </Tooltip>
        </div>
      ) : null}

      {/* Play button: hidden only while a run is actively executing/starting. When the run
          is finished but results are still visible, it appears again so the user can start a
          new execution (Clear Results remains available too). */}
      {executionState === "executing" || executionState === "paused" ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={abortExecution}
          disabled={isAborting}
        >
          {isAborting ? (
            <CircleNotchIcon className="size-3.5 animate-spin" />
          ) : (
            <SquareIcon weight="fill" className="size-3.5 text-bad" />
          )}
          {isAborting ? "Stopping…" : "Stop"}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={startExecution}
          disabled={isSaving}
        >
          {isStarting || executionState === "launching-executor" ? (
            <CircleNotchIcon className="size-3.5 animate-spin" />
          ) : (
            <PlayIcon weight="fill" className="size-3.5" />
          )}
          Run
        </Button>
      )}
    </div>
  );
};

export { ExecuteFlow };
