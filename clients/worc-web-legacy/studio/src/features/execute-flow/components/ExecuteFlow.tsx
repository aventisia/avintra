import { Button } from "@aventisia/ui/buttons";
import { IS_TAURI } from "@aventisia/ui/constants";
import { toast } from "@aventisia/ui/sonner";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PauseIcon, PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { Node } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { getAvailableCredits } from "@/features/available-credits/available-credits-apis";
import { useSaveFlow } from "@/features/react-flow/hooks/useSaveFlow";
import { getMySession } from "@/react-toolkit/apis/accounts-me-apis";
import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useTuariUserMetadataStore } from "@/stores/tuari-user-metadata-store";
import { NodeDataType } from "@/types/node-data-type";

import {
  CURRENT_JOB_ID_KEY,
  CURRENT_VERSION_ID_KEY,
  EXECUTION_LOG_KEY,
  clearNodeExecutionLog,
  doesFlowContainAnyDesktopOnlyNode,
  isEmptyFlow,
  isValidFlowGraph,
  useConfigKeyValuePairsInputs,
  useExecuteFlowMutation,
  useFetchSubFlows,
  useJobNotifications,
} from "..";
import { insertJob } from "../apis/jobs-table-apis";
import { JobStatusEnum } from "../enums/job-status-enum";
import useWebSocket from "../hooks/useWebSocket";
import { useJobDataStore } from "../stores/job-data-store";
import { extractInputsFromInputOutputObject } from "../utils/extract-inputs-from-inputoutputobject";

const ExecuteFlow = () => {
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Get user session state and actions
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get current flow and execution state from current flow store
  const {
    currentFlow,
    isFlowLoading,
    executionState,
    setCurrentFlow,
    setExecutionState,
  } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      isFlowLoading: state.isFlowLoading,
      executionState: state.executionState,
      setCurrentFlow: state.setCurrentFlow,
      setExecutionState: state.setExecutionState,
    })),
  );

  const { osID } = useTuariUserMetadataStore(
    useShallow((state) => ({
      osID: state.osID,
    })),
  );

  const { updateField } = useJobDataStore(
    useShallow((state) => ({
      updateField: state.updateField,
    })),
  );

  // Get nodes and edges from ReactFlowExt store
  const { nodes, edges, flowType } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      flowType: state.flowType,
    })),
  );

  // Save flow
  const { isPending: isSaving, saveData, isSavePending } = useSaveFlow();

  // Connect to websocket server and get sendCommand function
  const { sendCommand } = useWebSocket();

  // Get execute flow on web mutation
  const { executeFlowOnWebMutationAsync } = useExecuteFlowMutation();

  // Fetch and cache sub-flow graphs recursively in IndexedDB
  const { fetchAndStoreSubFlows } = useFetchSubFlows();

  // Connect to SignalR job notification hub to receive real-time job updates
  useJobNotifications(
    (notification) => {
      // Handle job completion notification
      console.log("Job completed:", notification);

      if (
        notification.status === "Completed" &&
        flowType !== FlowTypesEnum.ChatAgent
      ) {
        toast.success(
          notification.message || "Flow execution completed successfully!",
        );
        setExecutionState("stopped");
      } else if (notification.status === "Failed") {
        toast.error(notification.message || "Flow execution failed.");
        setExecutionState("stopped");
      } else if (notification.status === "Abort") {
        toast.info(notification.message || "Flow execution was aborted.");
        setExecutionState("stopped");
      }

      // Invalidate execution logs cache so the latest entry appears immediately
      queryClient.invalidateQueries({ queryKey: ["AGENT_JOB_EXECUTION"] });
    },
    (notification) => {
      // Handle job progress notification (optional)
      console.log("Job progress:", notification);
    },
  );

  const minCredits = 10;

  const { getConfigKeyValuePairsInputs } = useConfigKeyValuePairsInputs();

  const isCommercial = userSession?.deploymentType == "Commercial";
  const isEnterprise = userSession?.deploymentType == "Enterprise";
  const hasActivePlan = userSession?.planType == "Active";

  // Start execution
  const startExecution = async () => {
    // Skip this run if an execution is already in progress
    if (
      executionState === "executing" ||
      executionState === "launching-executor"
    ) {
      console.log(
        "Skipping new execution run: previous execution still in progress",
      );
      return;
    }

    setIsStarting(true);
    try {
      // Validate: Archived flow version cannot be executed
      if (currentFlow?.isArchived) {
        toast.info("Archived flows cannot be executed.");
        return;
      }

      // Validate: published flow version can only be executed via orchestrator
      if (currentFlow?.isPublished) {
        toast.info(
          "Published agents can only be executed via the Orchestrator.",
        );
        return;
      }

      // Save flow before execution and wait until complete
      if (isSavePending) {
        const saved = await saveData();

        if (!saved) {
          return;
        }
      }

      // Validate: Reject flow execution if it contains only support/placeholder nodes
      if (isEmptyFlow(nodes as Node<NodeDataType>[])) {
        toast.error("Flow is empty and cannot be executed.");
        return;
      }

      // Get flag indicating whether flow can only be executed in desktop executor
      let isDesktopOnlyFlow = doesFlowContainAnyDesktopOnlyNode(
        nodes as Node<NodeDataType>[],
      );

      // Temporary fix to run all flows in desktop executor if app is running in Tauri until our web executor is bugs free and supports all nodes
      if (IS_TAURI) isDesktopOnlyFlow = true;

      // Validate: Flow contains one or more executable nodes that are desktop-only and app is not running in Tauri
      if (!IS_TAURI && isDesktopOnlyFlow) {
        toast.error(
          "Flow contains desktop nodes which cannot be executed via web. Please remove desktop nodes from the flow and try again.",
        );
        return;
      }

      // Validate: Invalid react flow object or flow graph
      const flowGraphError = isValidFlowGraph(
        nodes as Node<NodeDataType>[],
        edges,
      );
      if (flowGraphError) {
        toast.error(`Flow graph is invalid: ${flowGraphError}`);
        return;
      }

      // Validate: Check credits for commercial deployment
      if (isCommercial) {
        const creditsData = await getAvailableCredits();

        if (
          creditsData?.data &&
          creditsData.data.availableCredits < minCredits
        ) {
          // Show toast notification for insufficient credits
          toast.error("Insufficient credits. Please top up to continue.");
          return;
        }
      }

      // Validate: Check for active plan in enterprise deployment
      if (isEnterprise && !hasActivePlan) {
        // Show toast notification for inactive plan
        toast.error(
          "This action is currently unavailable. Please contact your administrator or support.",
        );
        return;
      }

      // Fetch and store sub-flow graphs recursively in IndexedDB before execution
      try {
        await fetchAndStoreSubFlows(nodes as Node<NodeDataType>[]);
      } catch {
        return;
      }

      // Set the execution state to launching executor
      setExecutionState("launching-executor");

      // Get the jwt by calling the getMySession API
      const userSession = await getMySession();

      // If session is valid, proceed to execute the flow
      if (userSession) {
        // Get the access token from the session
        const accessToken = userSession.data?.accessToken;

        if (isDesktopOnlyFlow) {
          localStorage.removeItem("flowExecutionStack"); //  Clear any previous subflow stack
          localStorage.setItem("conditionalExecutionGroup", JSON.stringify([]));
          localStorage.setItem("loopExecutionGroup", JSON.stringify([]));
          openDesktopExecutor(accessToken);
        } else {
          try {
            // Call the execute endpoint to create a job and flow execution
            await executeFlowOnWebMutationAsync({
              flowVersionId: currentFlow.versionId,
            });
          } catch {
            // Reset the execution state on API failure
            setExecutionState("stopped");
            return;
          }
        }
      }
    } finally {
      setIsStarting(false);
    }
  };

  // Tauri API to open desktop executor
  const openDesktopExecutor = async (accessToken: string) => {
    try {
      // Add a input variables to triggerNode. This is required to set the input variables in the execution context before other node's execution starts.
      // It is immportant to set these inputs to trigger node dynamically because when we'll be
      // calling the agent/block in other master flow, at that time agent/block trigger inputs will come
      // from the caller flow's react flow object and not from the agent/block's own react flow object

      // Step 1: Extract inputs from inputOutputObject
      const inputVariables = extractInputsFromInputOutputObject(
        currentFlow.inputOutputObject || "",
      );

      // Step 2: Resolve config key placeholders into trigger inputs
      const configInputs = await getConfigKeyValuePairsInputs(
        nodes as Node<NodeDataType>[],
      );

      // Step 3: Merge and deduplicate by key while preserving order
      const mergedInputs = [...inputVariables, ...configInputs];

      // Step 4: Update trigger node inputs while creating the updated node list
      const updatedNodes = nodes.map((node) =>
        node.type === "triggerNode"
          ? {
              ...node,
              data: {
                ...node.data,
                label: "Setting up execution context...",
                inputs: mergedInputs,
              },
            }
          : node,
      );

      //  Create the job immediately to establish database metadata
      const executionStartTime = new Date();
      const jobRes = await insertJob({
        flowId: currentFlow.id,
        flowVersionId: currentFlow.versionId,
        duration: 0,
        status: JobStatusEnum.Running,
        startTime: executionStartTime,
        isPublished: false,
        nodeExecutionLogs: JSON.stringify([]),
        osId: osID,
      });

      //  Save job ID to currentFlow store so WebSocket heartbeat can reference it
      setCurrentFlow({ ...currentFlow, jobId: jobRes.data.id });
      updateField("startTime", executionStartTime);

      // Set versionId, nodes and edges in local storage BEFORE launching executor
      // to prevent race condition where executor sends "start" before localStorage is ready
      localStorage.setItem(CURRENT_VERSION_ID_KEY, currentFlow.versionId || "");
      localStorage.setItem(CURRENT_JOB_ID_KEY, jobRes.data.id || "");

      // Remove previous logs for this version before starting a fresh execution.
      await clearNodeExecutionLog();

      // One-time cleanup for legacy localStorage logs from before IndexedDB migration.
      localStorage.removeItem(EXECUTION_LOG_KEY);
      localStorage.setItem("nodes", JSON.stringify(updatedNodes));
      localStorage.setItem("edges", JSON.stringify(edges));

      // Get websocket port
      const wsPort = await invoke("get_websocket_port");

      // Call the Tauri command to launch the desktop executor
      const res = await invoke("launch_desktop_executor", {
        appBaseUrl: window.location.origin,
        wsPort,
        agentId: currentFlow.versionId,
        agentName: currentFlow.name,
        inputArgumentsJson: JSON.stringify({}), // For manual trigger we can send empty input arguments.
        accessToken,
      });
      console.log("Executor launched successfully:", res);

      //Set start time for the execution
      updateField("startTime", new Date());
    } catch (error) {
      // Inform the user about the failure
      toast.error(
        `Failed to launch the executor. Please try again. Error: ${error}`,
      );

      // Reset the executing state on failure
      setExecutionState("stopped");
    }
  };

  if (isFlowLoading || flowType === FlowTypesEnum.ChatAgent) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {executionState === "executing" || executionState === "paused" ? (
        <div className="group flex h-8 gap-1 rounded-lg bg-white/10">
          {executionState === "executing" ? (
            <Tooltip content="Pause">
              <Button
                variant="ghost"
                size="icon8"
                className="hover:bg-white/10"
                onClick={() => sendCommand("pause")}
              >
                <PauseIcon className="h-[1.1rem] w-[1.1rem] text-slate-500" />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip content="Resume">
              <Button
                variant="ghost"
                size="icon8"
                className="hover:bg-white/10"
                onClick={() => sendCommand("resume")}
              >
                <PlayIcon className="h-[1.1rem] w-[1.1rem] text-green-500/80" />
              </Button>
            </Tooltip>
          )}
          <Tooltip content="Abort">
            <Button
              variant="ghost"
              size="icon8"
              className="hover:bg-white/10"
              onClick={() => {
                localStorage.setItem(
                  "conditionalExecutionGroup",
                  JSON.stringify([]),
                );
                localStorage.setItem("loopExecutionGroup", JSON.stringify([]));
                setExecutionState("stopped");
                sendCommand("abort");
              }}
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
            onClick={() => {
              startExecution();
            }}
            disabled={isSaving}
          >
            {isStarting || executionState === "launching-executor" ? (
              <Loader2 className="h-[1.1rem] w-[1.1rem] animate-spin text-white/80" />
            ) : (
              <>
                <PlayIcon className="h-[1.1rem] w-[1.1rem] text-green-500/80" />
              </>
            )}
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export { ExecuteFlow };
