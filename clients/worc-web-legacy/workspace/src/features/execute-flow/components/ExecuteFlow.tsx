import { Button } from "@aventisia/ui/buttons";
import { toast } from "@aventisia/ui/sonner";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PauseIcon, PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { invoke } from "@tauri-apps/api/core";
import { Edge, Node } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { IS_TAURI } from "@/constants/constants";
import { getAvailableCredits } from "@/features/available-credits/available-credits-apis";
import { getMySession } from "@/react-toolkit/apis/accounts-me-apis";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { NodeDataType } from "@/types/node-data-type";

import { CURRENT_VERSION_ID_KEY, clearNodeExecutionLog } from "..";
import { fetchParentFlow } from "../apis/flow-builder-apis";
import { useFetchSubFlows } from "../hooks/useFetchSubFlows";
import useWebSocket from "../hooks/useWebSocket";
import { useCurrentFlowStore } from "../stores/current-flow-store";
import { deepParse } from "../utils/deepParse";
import { extractInputsFromInputOutputObject } from "../utils/extract-inputs-from-inputoutputobject";

const ExecuteFlow = ({ versionId }: { versionId: string; agentId: string }) => {
  // Connect to websocket server and get sendCommand function
  const { sendCommand } = useWebSocket();

  // Get current flow and execution state from current flow store
  const { executionState, setExecutionState, setCurrentFlow } =
    useCurrentFlowStore(
      useShallow((state) => ({
        executionState: state.executionState,
        setExecutionState: state.setExecutionState,
        setCurrentFlow: state.setCurrentFlow,
      })),
    );

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const isCommercial = userSession?.deploymentType == "Commercial";
  const { fetchAndStoreSubFlows } = useFetchSubFlows();

  const minCredits = 10;

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

    if (isCommercial) {
      const creditsData = await getAvailableCredits();

      if (creditsData?.data && creditsData.data.availableCredits < minCredits) {
        // Show toast notification for insufficient credits
        toast.error("Insufficient credits. Please top up to continue.");
        return;
      }
    }

    const currFlowData = await fetchParentFlow(versionId);
    if (!currFlowData?.data) return;

    setCurrentFlow({
      id: currFlowData?.data.flowId,
      versionId: currFlowData?.data.versionId,
      name: currFlowData?.data.flowName,
      inputOutputObject: currFlowData?.data.inputOutputObject || "",
      jobId: "",
      machineId: "",
    });
    const { nodes, edges } = deepParse(
      currFlowData?.data.reactFlowObject ?? "{}",
    ) as unknown as { nodes: Node[]; edges: Edge[] };

    try {
      await fetchAndStoreSubFlows(nodes as Node<NodeDataType>[]);
    } catch {
      return;
    }

    // Set the execution state to launching executor
    setExecutionState("launching-executor");

    // Get the jwt by calling the getMySession API
    const userSession = await getMySession();

    // If session is valid, proceed to open the desktop executor
    if (userSession) {
      // Get the access token from the session
      const accessToken = userSession.data?.accessToken;

      // Open the desktop executor if the app is running in Tauri
      if (IS_TAURI) {
        localStorage.removeItem("flowExecutionStack"); //  Clear any previous subflow stack
        localStorage.setItem("conditionalExecutionGroup", JSON.stringify([]));
        localStorage.setItem("loopExecutionGroup", JSON.stringify([]));
        openDesktopExecutor(
          accessToken,
          nodes,
          edges,
          currFlowData.data.flowName,
          currFlowData.data.inputOutputObject,
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
    inputOutputObject?: string,
  ) => {
    try {
      // Add input variables to triggerNode so they are set in execution context before remaining nodes run.
      const inputVariables = extractInputsFromInputOutputObject(
        inputOutputObject || "",
      );

      const updatedNodes = nodes.map((node) =>
        node.type === "triggerNode"
          ? {
              ...node,
              data: {
                ...node.data,
                label: "Setting up execution context...",
                inputs: inputVariables,
              },
            }
          : node,
      );

      // Set versionId, nodes and edges in local storage BEFORE launching executor
      // to prevent race condition where executor sends "start" before localStorage is ready
      localStorage.setItem(CURRENT_VERSION_ID_KEY, versionId || "");
      clearNodeExecutionLog();
      localStorage.setItem("nodes", JSON.stringify(updatedNodes));
      localStorage.setItem("edges", JSON.stringify(edges));

      // Get websocket port
      const wsPort = await invoke("get_websocket_port");

      // Call the Tauri command to launch the desktop executor
      const res = await invoke("launch_desktop_executor", {
        appBaseUrl: window.location.origin,
        wsPort,
        agentId: versionId,
        agentName: agentName,
        inputArgumentsJson: JSON.stringify({}), // For manuall trigger we can send empty input arguments.
        accessToken,
      });
      console.log("Executor launched successfully:", res);
    } catch (error) {
      // Inform the user about the failure
      toast.error(
        `Failed to launch the executor. Please try again. Error: ${error}`,
      );

      // Reset the executing state on failure
      setExecutionState("stopped");
    }
  };

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
          >
            {executionState === "launching-executor" ? (
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
