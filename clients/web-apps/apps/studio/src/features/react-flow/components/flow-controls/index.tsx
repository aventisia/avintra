import { Separator } from "@avplatform/ui";
import { Panel } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";

import { isSingleNodeAgentFlow } from "../../utils/single-node-agent-flow.util";
import { FCBContainer } from "./FCBContainer";
import { FCBRedo } from "./FCBRedo";
import { FCBUndo } from "./FCBUndo";

export const FlowControls = () => {
  // Get Studio Preferences store state
  const { undoRedo } = useStudioPreferencesStore(
    useShallow((state) => ({
      undoRedo: state.studioPreferences.undoRedo,
    })),
  );
  const flowType = useReactFlowExtStore((state) => state.flowType);

  return (
    <>
      {undoRedo && !isSingleNodeAgentFlow(flowType) && (
        <Panel position="top-left" onContextMenu={(e) => e.preventDefault()}>
          <FCBContainer>
            {/* Undo */}
            <FCBUndo />

            <Separator orientation="vertical" className="h-6" />

            {/* Redo */}
            <FCBRedo />
          </FCBContainer>
        </Panel>
      )}
    </>
  );
};
