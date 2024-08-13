import { Separator } from "@/react-toolkit/ui/separator";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Panel } from "@xyflow/react";
import { Scan } from "lucide-react";
import { VCActionButton } from "./VCActionButton";
import { VCBContainer } from "./VCBContainer";
import { VCBToggleLock } from "./VCBToggleLock";
import { VCBZoomTo } from "./VCBZoomTo";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { useShallow } from "zustand/react/shallow";

export const ViewControls = () => {
  // Get Studio Preferences store state
  const { hideIntractivityToggle, hideZoomControls } =
    useStudioPreferencesStore(
      useShallow((state) => ({
        hideIntractivityToggle: state.studioPreferences.hideIntractivityToggle,
        hideZoomControls: state.studioPreferences.hideZoomControls,
      })),
    );

  return (
    <Panel position="bottom-left">
      <div className="flex flex-col items-end space-y-4">
        {!hideZoomControls && (
          <VCBContainer>
            {/* Fit view button */}
            <VCActionButton action="fitView" Icon={Scan} />

            {/* Separate from zoom in-out */}
            <Separator orientation="horizontal" className="my-1 h-[0.5px]" />

            {/* Zoom out */}
            <VCActionButton action="zoomOut" Icon={MinusIcon} />

            {/* Zoom to 100% (reset) */}
            <VCBZoomTo />

            {/* Zoom in */}
            <VCActionButton action="zoomIn" Icon={PlusIcon} />
          </VCBContainer>
        )}

        {!hideIntractivityToggle && (
          <VCBContainer>
            {/* Lock or unlock ReactFlow */}
            <VCBToggleLock />
          </VCBContainer>
        )}
      </div>
    </Panel>
  );
};
