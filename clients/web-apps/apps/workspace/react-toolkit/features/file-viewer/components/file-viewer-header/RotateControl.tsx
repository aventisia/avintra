import { Button } from "@avplatform/ui/buttons";
import { RotateCcwIcon, RotateCwIcon } from "lucide-react";

import { useRotateControls } from "../../stores/file-viewer-store";

const RotateControl = () => {
  const { rotateLeft, rotateRight } = useRotateControls();

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Rotate controls">
      <Button
        variant="ghost"
        size="icon7"
        onClick={rotateLeft}
        title="Rotate left 90°"
        aria-label="Rotate left"
      >
        <RotateCcwIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon7"
        onClick={rotateRight}
        title="Rotate right 90°"
        aria-label="Rotate right"
      >
        <RotateCwIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default RotateControl;
