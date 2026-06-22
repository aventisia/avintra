import { toast } from "@aventisia/ui/sonner";
import { invoke } from "@tauri-apps/api/core";
import { Edge, Node } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { IS_TAURI } from "@/constants/constants";
import { getAvailableCredits } from "@/features/available-credits/available-credits-apis";
import { getMySession } from "@/react-toolkit/apis/accounts-me-apis";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { NodeDataType } from "@/types/node-data-type";

import { CURRENT_VERSION_ID_KEY } from "../constants/constants";
import { JobDetailsDto } from "../dtos/job-details-dto";
import { useCurrentFlowStore } from "../stores/current-flow-store";
import { useJobDataStore } from "../stores/job-data-store";
import { deepParse } from "../utils/deepParse";
import { extractInputsFromInputOutputObject } from "../utils/extract-inputs-from-inputoutputobject";
import { clearNodeExecutionLog } from "../utils/save-node-execution-log";
import { useConfigKeyValuePairsInputs } from "./useConfigKeyValuePairsInputs";
import useWebSocket from "./useWebSocket";

export default function useExecuteFlow() {
  // Get current flow and execution state from current
  const { setExecutionState, setCurrentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      executionState: state.executionState,
      setExecutionState: state.setExecutionState,
      setCurrentFlow: state.setCurrentFlow,
    })),
  );
  const { updateField } = useJobDataStore(
    useShallow((state) => ({
      updateField: state.updateField,
    })),
  );

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  const isCommercial = userSession?.deploymentType == "Commercial";
  const isEnterprise = userSession?.deploymentType == "Enterprise";
  const hasActivePlan = userSession?.planType == "Active";

  const { sendCommand } = useWebSocket();

  const { getConfigKeyValuePairsInputs } = useConfigKeyValuePairsInputs();

  const minCredits = 10;

  // Start execution
  const startExecution = async (data: JobDetailsDto) => {
    if (isCommercial) {
      const creditsData = await getAvailableCredits();

      if (creditsData?.data && creditsData.data.availableCredits < minCredits) {
        // Show toast notification for insufficient credits
        toast.error("Insufficient credits. Please top up to continue.");
        return;
      }
    }
    // Check plan for enterprise
    if (isEnterprise && !hasActivePlan) {
      // Show toast notification for inactive plan
      toast.error(
        "This action is currently unavailable. Please contact your administrator or support.",
      );
      return;
    }
    if (!data) return;

    setCurrentFlow({
      id: data?.flowId || "",
      versionId: data?.flowVersionId,
      inputOutputObject: data?.inputOutputObject || "",
      name: data?.name || "",
      jobId: data.id,
      machineId: data.machineId,
    });

    const { nodes, edges } = deepParse(
      data.reactFlowObject ?? "{}",
    ) as unknown as { nodes: Node[]; edges: Edge[] };

    // Set the execution state to launching executor
    setExecutionState("launching-executor");

    // Get the jwt by calling the getMySession API
    const userSession = await getMySession();

    // If session is valid, proceed to open the desktop executor
    if (userSession) {
      // Get the access token from the session
      const accessToken = userSession.data?.accessToken;

      // console.log(
      //   "ConfigKeys:",
      //   extractUniqueConfigKeys(nodes as Node<NodeDataType>[]),
      // );

      // Open the desktop executor if the app is running in Tauri
      if (IS_TAURI) {
        localStorage.removeItem("flowExecutionStack"); //  Clear any previous subflow stack
        localStorage.setItem("conditionalExecutionGroup", JSON.stringify([]));
        localStorage.setItem("loopExecutionGroup", JSON.stringify([]));
        openDesktopExecutor(
          accessToken,
          nodes,
          edges,
          data?.name || "",
          data.flowVersionId,
          data.inputArgumentsJson || "{}",
          data.inputOutputObject || "",
        );
      } else {
        toast.info(
          "Please use our desktop app. Execution in browser is not supported.",
        );
        // Reset the execution state to stopped if not in Tauri
        setExecutionState("stopped");
      }
    }
  };

  // Tauri API to open desktop executor
  const openDesktopExecutor = async (
    accessToken: string,
    nodes: Node[],
    edges: Edge[],
    agentName: string,
    versionId: string,
    inputArgumentsJson: string,
    inputOutputObject: string,
  ) => {
    console.log(
      "ExecuteFlow - Opening desktop executor with inputOutputObject:",
      inputOutputObject,
    );
    try {
      // Get websocket port
      const wsPort = await invoke("get_websocket_port");

      // Call the Tauri command to launch the desktop executor
      const res = await invoke("launch_desktop_executor", {
        appBaseUrl: window.location.origin,
        wsPort,
        agentId: versionId,
        agentName: agentName,
        inputArgumentsJson: inputArgumentsJson,
        accessToken,
      });
      console.log("Executor launched successfully:", res);

      updateField("startTime", new Date());

      // Add a input variables to triggerNode. This is required to set the input variables in the execution context before other node's execution starts.
      // It is immportant to set these inputs to trigger node dynamically because when we'll be
      // calling the agent/block in other master flow, at that time agent/block trigger inputs will come
      // from the caller flow's react flow object and not from the agent/block's own react flow object

      // Step 1: Extract inputs from inputArgumentsJson
      const inputVariables = extractInputsFromInputOutputObject(
        inputOutputObject || "",
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

      // Set versionId, nodes and edges in local storage for executor
      localStorage.setItem(CURRENT_VERSION_ID_KEY, versionId || "");
      clearNodeExecutionLog();
      localStorage.setItem("nodes", JSON.stringify(updatedNodes));
      localStorage.setItem("edges", JSON.stringify(edges));
    } catch (error) {
      // Inform the user about the failure
      toast.error(
        `Failed to launch the executor. Please try again. Error: ${error}`,
      );

      // Reset the executing state on failure
      setExecutionState("stopped");
    }
  };

  return { startExecution, sendCommand, setExecutionState };
}
