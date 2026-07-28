import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { Separator } from "@avplatform/ui";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Panel } from "@xyflow/react";
import { Scan } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { VCActionButton } from "./VCActionButton";
import { VCBContainer } from "./VCBContainer";
import { memo } from "react";

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
        {zoomControls && (
          <VCBContainer>
            {/* Fit view button */}
            <VCActionButton action="fitView" Icon={Scan} />

            {/* Separate from zoom in-out */}
            <Separator orientation="horizontal" className="my-1 h-[0.5px]" />

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
