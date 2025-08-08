import { Button } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { Redo, RotateCcw, Undo, ZoomInIcon, ZoomOutIcon } from "lucide-react";

// Add tooltip to buttons
interface ControlPanelProps {
  zoomLevel: number;
  zoomInHandler: () => void;
  zoomOutHandler: () => void;
  resetTransformHandler: () => void;
  rotateClockwiseHandler: () => void;
  rotateAnticlockwiseHandler: () => void;
}
const ControlPanel = ({
  zoomLevel = 100,
  zoomInHandler,
  zoomOutHandler,
  resetTransformHandler,
  rotateClockwiseHandler,
  rotateAnticlockwiseHandler,
}: ControlPanelProps) => {
  return (
    <div className="flex h-12 w-full items-center justify-between rounded-t-lg border-b p-2">
      <div className="flex items-center gap-1">
        <Tooltip content="Rotate left" side="bottom" className="text-xs">
          <Button
            variant="ghost"
            size="icon7"
            className="bg-accent"
            onClick={() => rotateAnticlockwiseHandler()}
          >
            <Undo className={`h-5 w-5 cursor-pointer stroke-[1.5] `} />
          </Button>
        </Tooltip>
        <Tooltip content="Rotate right" side="bottom" className="text-xs">
          <Button
            variant="ghost"
            size="icon7"
            className="bg-accent"
            onClick={() => rotateClockwiseHandler()}
          >
            <Redo className={`h-5 w-5 cursor-pointer stroke-[1.5] `} />
          </Button>
        </Tooltip>
        <Tooltip content="Reset" side="bottom" className="text-xs">
          <Button
            variant="ghost"
            size="icon7"
            className="bg-accent"
            onClick={() => resetTransformHandler()}
          >
            <RotateCcw className={`h-5 w-5 cursor-pointer stroke-[1.5] `} />
          </Button>
        </Tooltip>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon7" onClick={() => zoomOutHandler()}>
          <ZoomOutIcon className={`h-5 w-5 cursor-pointer stroke-[1.5] `} />
        </Button>
        <span className="text-sm">{zoomLevel}%</span>
        <Button variant="ghost" size="icon7" onClick={() => zoomInHandler()}>
          <ZoomInIcon className={`h-5 w-5 cursor-pointer stroke-[1.5] `} />
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
