import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { PlayIcon, PauseIcon, StopIcon } from "@heroicons/react/24/solid";

const ExecuteFlow = () => {
  const isFlowExecuting = false;

  const openFile = () => {
    console.log("open file");
    const filePath =
      "C:\\My Space\\PLAYGROUND\\StockAnalysisAutomationDemo\\StockAnalysisAutomationDemo.exe";
    if (window)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).electron.openFile(filePath);
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
          onClick={() => openFile()}
        >
          <PlayIcon className="h-4 w-4 text-green-500" />
          Execute
        </Button>
      )}
    </div>
  );
};

export { ExecuteFlow };
