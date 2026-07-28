import { Separator } from "@avplatform/ui";
import { Panel } from "@xyflow/react";
import { FCBContainer } from "./FCBContainer";
import { FCBRedo } from "./FCBRedo";
import { FCBUndo } from "./FCBUndo";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { useShallow } from "zustand/react/shallow";

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
