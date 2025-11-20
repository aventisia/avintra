import { Button } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PauseIcon, PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";

type ExecutionActionProps = {
  rowId: string;
  isDisabled: boolean;
  executionState: string;
};
export const ExecutionAction = ({
  rowId,
  isDisabled,
  executionState,
}: ExecutionActionProps) => {
  return (
    <div className="flex items-center max-w-5">
      {executionState === "executing" || executionState === "paused" ? (
        <div className="group flex h-8 gap-1 rounded-lg bg-white/10">
          {executionState === "executing" ? (
            <Tooltip content="Pause">
              <Button
                variant="ghost"
                size="icon8"
                className="hover:bg-white/10"
                // onClick={() => sendCommand("pause")}
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
                // onClick={() => sendCommand("resume")}
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
              // onClick={() => {
              //   localStorage.setItem(
              //     "conditionalExecutionGroup",
              //     JSON.stringify([]),
              //   );
              //   localStorage.setItem("loopExecutionGroup", JSON.stringify([]));
              //   setExecutionState("stopped");
              //   sendCommand("abort");
              // }}
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
            disabled={isDisabled}
            // onClick={() => {
            //   if (isAssist) {
            //     getFlow(flowId || "");
            //   } else startExecution();
            // }}
            onClick={() => console.log(rowId)}
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
