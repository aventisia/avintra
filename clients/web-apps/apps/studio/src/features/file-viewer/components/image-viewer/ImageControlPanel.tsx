import { Separator } from "@avplatform/ui";

import RotateControl from "../file-viewer-header/RotateControl";
import ZoomControl from "../file-viewer-header/ZoomControl";

const ImageControlPanel = () => (
  <div className="flex items-center gap-1">
    <ZoomControl />
    <Separator orientation="vertical" className="h-5" />
    <RotateControl />
    <Separator orientation="vertical" className="h-5" />
  </div>
);

export default ImageControlPanel;
