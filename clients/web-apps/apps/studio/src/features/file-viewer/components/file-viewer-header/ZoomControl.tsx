import { Button } from "@avplatform/ui/buttons";
import { MinusIcon, PlusIcon } from "lucide-react";

import {
  SCALE_MAX,
  SCALE_MIN,
  useZoomControls,
} from "../../stores/file-viewer-store";

const ZoomControl = () => {
  const { zoomIn, zoomOut, canZoomIn, canZoomOut } = useZoomControls();

  return (
    <div
      className="flex items-center gap-0.5"
      role="group"
      aria-label="Zoom controls"
    >
      <Button
        variant="ghost"
        size="icon7"
        onClick={zoomIn}
        disabled={!canZoomIn}
        title={`Zoom in (max ${SCALE_MAX * 100}%)`}
        aria-label="Zoom in"
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon7"
        onClick={zoomOut}
        disabled={!canZoomOut}
        title={`Zoom out (min ${SCALE_MIN * 100}%)`}
        aria-label="Zoom out"
      >
        <MinusIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ZoomControl;
