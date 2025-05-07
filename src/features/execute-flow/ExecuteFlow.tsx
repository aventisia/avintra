import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { PauseIcon, PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { invoke } from "@tauri-apps/api/core";

const ExecuteFlow = () => {
  const isFlowExecuting = false;

  // Tauri API to open desktop executor
  const openDesktopExecutor = async () => {
    await invoke("launch_desktop_executor", {
      jwt: "dummy_jwt",
    })
      .then((res) => console.log(res))
      .catch((e) => console.error(e));
  };

  return (
    <div className="flex h-7 items-center justify-center gap-2 rounded-lg bg-muted">
      {isFlowExecuting ? (
        <>
          <Tooltip content="Pause">
            <Button variant="ghost" size="icon7">
              <PauseIcon className="h-4 w-4 text-slate-500" />
            </Button>
          </Tooltip>
          <Tooltip content="Stop">
            <Button variant="ghost" size="icon7">
              <StopIcon className="h-4 w-4 text-red-500" />
            </Button>
          </Tooltip>
        </>
      ) : (
        <Button
          variant={"ghost"}
          className="group h-7 gap-1.5 whitespace-nowrap rounded-md px-2"
          onClick={() => openDesktopExecutor()}
        >
          <PlayIcon className="h-4 w-4 text-green-500" />
          Execute
        </Button>
      )}
    </div>
  );
};

export { ExecuteFlow };
