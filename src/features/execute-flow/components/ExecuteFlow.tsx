import { IS_TAURI } from "@/constants";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { Button } from "@aventisia/ui/buttons";
import { toast } from "@aventisia/ui/sonner";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PauseIcon, PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { invoke } from "@tauri-apps/api/core";
import { Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { CURRENT_VERSION_ID_KEY } from "..";
import useWebSocket from "../hooks/useWebSocket";

const ExecuteFlow = () => {
  // Get current flow and execution state from current flow store
  const { currentFlow, executionState, setExecutionState } =
    useCurrentFlowStore(
      useShallow((state) => ({
        currentFlow: state.currentFlow,
        executionState: state.executionState,
        setExecutionState: state.setExecutionState,
      })),
    );

  // Get nodes and edges from ReactFlowExt store
  const { nodes, edges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    })),
  );

  // Connect to websocket server and get sendCommand function
  const { sendCommand } = useWebSocket();

  // Start execution
  const startExecution = () => {
    // Set the execution state to launching executor
    setExecutionState("launching-executor");

    // Open the desktop executor if the app is running in Tauri
    if (IS_TAURI) {
      localStorage.setItem("conditionalExecutionGroup", JSON.stringify([]));
      localStorage.setItem("loopExecutionGroup", JSON.stringify([]));
      openDesktopExecutor();
    } else {
      toast.info(
        "Please use our desktop app. Execution in browser is not supported.",
      );
      // Reset the execution state to stopped if not in Tauri
      setExecutionState("stopped");
    }
  };

  // Tauri API to open desktop executor
  const openDesktopExecutor = async () => {
    try {
      // Call the Tauri command to launch the desktop executor
      await invoke("launch_desktop_executor", {
        agentName: currentFlow.name,
      })
        .then((res) => {
          console.log("Executor launched successfully:", res);

          // Set versionId, nodes and edges in local storage for executor
          localStorage.setItem(
            CURRENT_VERSION_ID_KEY,
            currentFlow.versionId || "",
          );
          localStorage.setItem("nodes", JSON.stringify(nodes));
          localStorage.setItem("edges", JSON.stringify(edges));
        })
        .catch((e) => console.error(e));
    } catch (error) {
      // Inform the user about the failure
      toast.error("Failed to launch the executor. Please try again.");

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
            onClick={startExecution}
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

