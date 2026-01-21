import { IS_TAURI } from "@/constants";
import { useFetchFlowToExecute } from "@/features/agents-assist/hooks/useFetchFlowToExecute";
import { getMySession } from "@/react-toolkit/apis/accounts-me-apis";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { Button } from "@aventisia/ui/buttons";
import { toast } from "@aventisia/ui/sonner";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PauseIcon, PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { invoke } from "@tauri-apps/api/core";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { clearNodeExecutionLog, CURRENT_VERSION_ID_KEY } from "..";
import useWebSocket from "../hooks/useWebSocket";
import { getAvailableCredits } from "@/features/available-credits/available-credits-apis";
import { extractUniqueConfigKeys } from "../utils/config-key-utils";
import { Node } from "@xyflow/react";
import { NodeDataType } from "@/types/node-data-type";
import { useJobDataStore } from "../stores/job-data-store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

const ExecuteFlow = ({
  isAssist = false,
  flowId,
}: {
  flowId?: string;
  isAssist?: boolean;
}) => {
  // Get user session state and actions
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get current flow and execution state from current flow store
  const { currentFlow, executionState, setExecutionState } =
    useCurrentFlowStore(
      useShallow((state) => ({
        currentFlow: state.currentFlow,
        executionState: state.executionState,
        setExecutionState: state.setExecutionState,
      })),
    );

  const { updateField } = useJobDataStore(
    useShallow((state) => ({
      updateField: state.updateField,
    })),
  );

  // Get nodes and edges from ReactFlowExt store
  const { nodes, edges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    })),
  );

  const { isFlowReady, getFlow } = useFetchFlowToExecute();

  // Connect to websocket server and get sendCommand function
  const { sendCommand } = useWebSocket();

  const minCredits = 10;

  const isCommercial = userSession?.deploymentType == "Commercial";

  // Start execution
  const startExecution = async () => {
    if (currentFlow?.isPublished) {
      toast.info("Published agents can only be executed via the Orchestrator.");
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
    // Set the execution state to launching executor
    setExecutionState("launching-executor");

    // Get the jwt by calling the getMySession API
    const userSession = await getMySession();

    // If session is valid, proceed to open the desktop executor
    if (userSession) {
      // Get the access token from the session
      const accessToken = userSession.data?.accessToken;

      console.log(
        "ConfigKeys:",
        extractUniqueConfigKeys(nodes as Node<NodeDataType>[]),
      );

      // Open the desktop executor if the app is running in Tauri
      if (IS_TAURI) {
        localStorage.removeItem("flowExecutionStack"); //  Clear any previous subflow stack
        localStorage.setItem("conditionalExecutionGroup", JSON.stringify([]));
        localStorage.setItem("loopExecutionGroup", JSON.stringify([]));
        openDesktopExecutor(accessToken);
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
  const openDesktopExecutor = async (accessToken: string) => {
    try {
      // Get websocket port
      const wsPort = await invoke("get_websocket_port");

      // Call the Tauri command to launch the desktop executor
      const res = await invoke("launch_desktop_executor", {
        wsPort,
        agentId: currentFlow.versionId,
        agentName: currentFlow.name,
        accessToken,
      });
      console.log("Executor launched successfully:", res);

      //Set start time for the execution
      updateField("startTime", new Date());

      // Set versionId, nodes and edges in local storage for executor
      localStorage.setItem(CURRENT_VERSION_ID_KEY, currentFlow.versionId || "");
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

  //To handle execution form Assist window
  useEffect(() => {
    if (isFlowReady) startExecution();
  }, [isFlowReady]);

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
              if (isAssist) {
                getFlow(flowId || "");
              } else startExecution();
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
