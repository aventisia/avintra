import { Separator } from "@avplatform/ui";
import { Panel } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";

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

  return (
    <>
      {undoRedo && (
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
