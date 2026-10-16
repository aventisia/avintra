import { Separator } from "@avplatform/ui";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Panel } from "@xyflow/react";
import { Scan } from "lucide-react";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";

import { isSingleNodeAgentFlow } from "../../utils/single-node-agent-flow.util";
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
  const isSingleNodeAgent = isSingleNodeAgentFlow(flowType);

  return (
    <Panel position="bottom-left">
      <div className="flex items-center gap-2">
        {/* Undo and Redo Controls */}
        {!isSingleNodeAgent && <VCBUndoRedo />}

        {zoomControls && (
          <VCBContainer>
            {/* Fit view button */}
            <VCActionButton action="fitView" Icon={Scan} />

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

        {!isSingleNodeAgent && cursorToggle && (
          <VCBContainer>
            <VCBToggleCursor />
          </VCBContainer>
        )}
      </div>
    </Panel>
  );
});
