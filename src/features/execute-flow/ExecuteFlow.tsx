import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { PlayIcon, PauseIcon, StopIcon } from "@heroicons/react/24/solid";

const ExecuteFlow = () => {
  const isFlowExecuting = false;

  return (
    <div className="flex h-9 items-center justify-center gap-2 rounded-lg bg-muted p-1.5">
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
          className="group h-7 gap-1.5 whitespace-nowrap rounded-md px-2 hover:bg-white hover:text-foreground hover:shadow-sm"
        >
          <PlayIcon className="h-4 w-4 text-green-500" />
          Execute
        </Button>
      )}
    </div>
  );
};

export { ExecuteFlow };
0