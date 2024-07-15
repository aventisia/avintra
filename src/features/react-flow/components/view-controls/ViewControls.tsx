import { Panel } from "@xyflow/react";
import { Separator } from "@/react-toolkit/components/ui";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { VCActionButton } from "./VCActionButton";
import { Scan } from "lucide-react";
import { VCBZoomTo } from "./VCBZoomTo";
import { VCBToggleLock } from "./VCBToggleLock";
import { VCBContainer } from "./VCBContainer";

export const ViewControls = () => {
  return (
    <Panel position="bottom-left">
      <div className="flex items-end space-x-4">
        {/* Container-1 */}
        <VCBContainer>
          {/* Lock or unlock ReactFlow */}
          <VCBToggleLock />
        </VCBContainer>

        {/* Container-2 */}
        <VCBContainer>
          {/* Fit view button */}
          <VCActionButton action="fitView" Icon={Scan} />

          {/* Separate from zoom in-out */}
          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Zoom out */}
          <VCActionButton action="zoomOut" Icon={MinusIcon} />

          {/* Zoom to 100% (reset) */}
          <VCBZoomTo />

          {/* Zoom in */}
          <VCActionButton action="zoomIn" Icon={PlusIcon} />
        </VCBContainer>
      </div>
    </Panel>
  );
};
