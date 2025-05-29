import { Button } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useTauriStore } from "@/stores/tauri-store";
import { PauseIcon, PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { invoke } from "@tauri-apps/api/core";

import { useShallow } from "zustand/react/shallow";
import useWebSocket from "./useWebSocket";
import { Loader2 } from "lucide-react";

const ExecuteFlow = () => {
  const { currentFlow, flowState, setFlowState } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      flowState: state.flowState,
      setFlowState: state.setFlowState,
    })),
  );

  // Connect to websocket server
  const { sendCommand } = useWebSocket();

  // Get the state if app is open in tauri window
  const { isTauri } = useTauriStore(
    useShallow((state) => ({
      isTauri: state.isTauri,
    })),
  );

  // Start execution
  const startExecution = () => {
    // Set the executing state to true
    setFlowState("launching-executor");

    // Open the desktop executor if the app is running in Tauri
    if (isTauri) {
      openDesktopExecutor();
    } else {
      // TODO: If not in Tauri, start web executor
      console.warn("Not running in Tauri, starting execution in browser");
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
      console.error("Failed to launch node executor", error);
      setFlowState("stopped"); // Reset the executing state on failure
    }
  };

  return (
    <div className="flex items-center gap-2">
      {flowState === "executing" || flowState === "paused" ? (
        <div className="group flex h-8 gap-1 rounded-lg bg-white/10">
          {flowState === "executing" ? (
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
              onClick={() => sendCommand("abort")}
            >
              <StopIcon className="h-[1.1rem] w-[1.1rem] text-red-500/80" />
            </Button>
          </Tooltip>
        </div>
      ) : (
        <Tooltip content="Execute">
          <Button
            size="icon8"
            variant="ghost"
            className="hover:bg-white/10"
            onClick={startExecution}
          >
            {flowState === "launching-executor" ? (
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
