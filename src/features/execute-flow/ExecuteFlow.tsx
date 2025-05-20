import {
  getMySession,
  refreshSession,
} from "@/react-toolkit/apis/accounts-me-apis";
import { Button } from "@aventisia/ui/buttons";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
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
      // Get fresh JWT token
      const response = import.meta.env.DEV
        ? await getMySession()
        : await refreshSession();

      // Once promise is resolved
      if (response) {
        // Call the Tauri command to launch the desktop executor
        await invoke("launch_desktop_executor", {
          agentName: currentFlow.name,
          agentId: currentFlow.id,
          jwt: response.data.accessToken ?? "jwt",
        })
          .then((res) => console.log(res))
          .catch((e) => console.error(e));
      }
    } catch (error) {
      console.error("Failed to launch node executor", error);
      setFlowState("stopped"); // Reset the executing state on failure
    }
  };

  return (
    <div className="flex h-7 items-center justify-center gap-2 rounded-lg bg-muted">
      {flowState === "executing" || flowState === "paused" ? (
        <>
          {flowState === "executing" ? (
            <Tooltip content="Pause">
              <Button
                variant="ghost"
                size="icon7"
                onClick={() => sendCommand("pause")}
              >
                <PauseIcon className="h-4 w-4 text-slate-500" />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip content="Resume">
              <Button
                variant="ghost"
                size="icon7"
                onClick={() => sendCommand("resume")}
              >
                <PlayIcon className="h-4 w-4 text-green-500" />
              </Button>
            </Tooltip>
          )}
          <Tooltip content="Abort">
            <Button
              variant="ghost"
              size="icon7"
              onClick={() => sendCommand("abort")}
            >
              <StopIcon className="h-4 w-4 text-red-500" />
            </Button>
          </Tooltip>
        </>
      ) : (
        <Button
          variant={"ghost"}
          className="group h-7 min-w-[6rem] gap-1.5 whitespace-nowrap rounded-md px-2"
          onClick={startExecution}
        >
          {flowState === "launching-executor" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <PlayIcon className="h-4 w-4 text-green-500" />
              Execute
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export { ExecuteFlow };
