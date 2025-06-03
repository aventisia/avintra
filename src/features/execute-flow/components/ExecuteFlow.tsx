import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useTauriStore } from "@/stores/tauri-store";
import { Button } from "@aventisia/ui/buttons";
import { toast } from "@aventisia/ui/sonner";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PauseIcon, PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { invoke } from "@tauri-apps/api/core";
import { Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import useWebSocket from "../hooks/useWebSocket";

const ExecuteFlow = () => {
  // Get current flow and execution state from current flow store
  const {
    currentFlow,
    executionState,
    setConditionalExecutionGroup,
    setLoopExecutionGroup,
    setExecutionState,
  } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      executionState: state.executionState,
      setConditionalExecutionGroup: state.setConditionalExecutionGroup,
      setLoopExecutionGroup: state.setLoopExecutionGroup,
      setExecutionState: state.setExecutionState,
    })),
  );

  // Connect to websocket server and get sendCommand function
  const { sendCommand } = useWebSocket();

  // Get the state if app is open in tauri window
  const { isTauri } = useTauriStore(
    useShallow((state) => ({
      isTauri: state.isTauri,
    })),
  );

  // Start execution
  const startExecution = () => {
    // Set the execution state to launching executor
    setExecutionState("launching-executor");
    setConditionalExecutionGroup([]);
    setLoopExecutionGroup([]);

    // Open the desktop executor if the app is running in Tauri
    if (isTauri) {
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
        .then((res) => console.log(res))
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
                setConditionalExecutionGroup([]);
                setLoopExecutionGroup([]);
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
