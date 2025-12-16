import { toast } from "@aventisia/ui/sonner";
import { invoke } from "@tauri-apps/api/core";
import { Edge, Node } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { IS_TAURI } from "@/constants/constants";
import { getAvailableCredits } from "@/features/available-credits/available-credits-apis";
import { getMySession } from "@/react-toolkit/apis/accounts-me-apis";

import { CURRENT_VERSION_ID_KEY } from "../constants/constants";
import { JobDetailsDto } from "../dtos/job-details-dto";
import { useCurrentFlowStore } from "../stores/current-flow-store";
import { deepParse } from "../utils/deepParse";
import { clearNodeExecutionLog } from "../utils/save-node-execution-log";

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

  const { sendCommand } = useWebSocket();

  const minCredits = 10;

  // Start execution
  const startExecution = async (data: JobDetailsDto) => {
    const creditsData = await getAvailableCredits();

    if (creditsData?.data && creditsData.data.availableCredits < minCredits) {
      // Show toast notification for insufficient credits
      toast.error("Insufficient credits. Please top up to continue.");
      return;
    }

    if (!data) return;

    setCurrentFlow({
      id: data.flowId,
      versionId: data?.flowVersionId,
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
  ) => {
    try {
      // Get websocket port
      const wsPort = await invoke("get_websocket_port");

      // Call the Tauri command to launch the desktop executor
      const res = await invoke("launch_desktop_executor", {
        wsPort,
        agentId: versionId,
        agentName: agentName,
        accessToken,
      });
      console.log("Executor launched successfully:", res);

      // Set versionId, nodes and edges in local storage for executor
      localStorage.setItem(CURRENT_VERSION_ID_KEY, versionId || "");
      clearNodeExecutionLog();
      localStorage.setItem("nodes", JSON.stringify(nodes));
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
