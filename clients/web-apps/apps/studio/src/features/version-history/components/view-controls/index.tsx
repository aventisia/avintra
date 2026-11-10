import { Separator } from "@avplatform/ui";
import { MinusIcon, PlusIcon, ScanIcon } from "@phosphor-icons/react";
import { Panel } from "@xyflow/react";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";

import { VCActionButton } from "./VCActionButton";
import { VCBContainer } from "./VCBContainer";

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
      <div className="flex items-center gap-2">
        {zoomControls && (
          <VCBContainer>
            {/* Fit view button */}
            <VCActionButton action="fitView" Icon={ScanIcon} />

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
