import { Separator } from "@avplatform/ui";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Panel } from "@xyflow/react";
import { Scan } from "lucide-react";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";

import { VCActionButton } from "./VCActionButton";
import { VCBContainer } from "./VCBContainer";
import { VCBranchStatsButton } from "./VCBranchStatsButton";
import { VCExternalLoopSelector } from "./VCExternalLoopSelector";

export const ViewControls = memo(() => {
  // Get Studio Preferences store state
  const { zoomControls } = useStudioPreferencesStore(
    useShallow((state) => ({
      cursorToggle: state.studioPreferences.cursorToggle,
      zoomControls: state.studioPreferences.zoomControls,
    })),
  );

  return (
    <Panel position="bottom-left">
      <div className="flex flex-col items-end space-y-4">
        {/* Iteration browsing for loops that live outside the loaded graph (sub-flow in a loop).
            Kept in its own group so it is not visually mixed with the zoom controls. */}
        <VCExternalLoopSelector />

        {zoomControls && (
          <VCBContainer>
            <VCBranchStatsButton />
            {/* Separate from zoom in-out */}
            <Separator orientation="vertical" className="mx-1 w-[0.5px]" />

            {/* Fit view button */}
            <VCActionButton action="fitView" Icon={Scan} />

            {/* Separate from zoom in-out */}
            <Separator orientation="vertical" className="mx-1 w-[0.5px]" />

            {/* Zoom out */}
            <VCActionButton action="zoomOut" Icon={MinusIcon} />

            {/* Zoom in */}
            <VCActionButton action="zoomIn" Icon={PlusIcon} />
          </VCBContainer>
        )}
      </div>
    </Panel>
  );
});
