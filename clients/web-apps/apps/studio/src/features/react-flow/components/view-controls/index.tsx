import { Separator } from "@avplatform/ui";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { MinusIcon, PlusIcon, ScanIcon } from "@phosphor-icons/react";
import { Panel } from "@xyflow/react";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";

import { VCActionButton } from "./VCActionButton";
import { VCBContainer } from "./VCBContainer";
import { VCBToggleCursor } from "./VCBToggleCursor";
import { VCBUndoRedo } from "./VCBUndoRedo";
import { VCBZoomTo } from "./VCBZoomTo";

export const ViewControls = memo(() => {
  // Get Studio Preferences store state
  const { cursorToggle, zoomControls } = useStudioPreferencesStore(
    useShallow((state) => ({
      cursorToggle: state.studioPreferences.cursorToggle,
      zoomControls: state.studioPreferences.zoomControls,
    })),
  );
  const flowType = useReactFlowExtStore((state) => state.flowType);
  const isChatAgent = flowType === FlowTypesEnum.ChatAgent;

  return (
    <Panel position="bottom-left">
      <div className="flex items-center gap-2">
        {/* Undo and Redo Controls */}
        {!isChatAgent && <VCBUndoRedo />}

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

            {import.meta.env.MODE !== "production" && (
              <>
                <Separator orientation="vertical" className="mx-1 w-[0.5px]" />
                <VCBZoomTo />
              </>
            )}
          </VCBContainer>
        )}

        {!isChatAgent && cursorToggle && (
          <VCBContainer>
            <VCBToggleCursor />
          </VCBContainer>
        )}
      </div>
    </Panel>
  );
});
