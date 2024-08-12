import { Separator } from "@/react-toolkit/ui/separator";
import { Panel } from "@xyflow/react";
import { FCBContainer } from "./FCBContainer";
import { FCBRedo } from "./FCBRedo";
import { FCBUndo } from "./FCBUndo";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { useShallow } from "zustand/react/shallow";

export const FlowControls = () => {
  // Get Studio Preferences store state
  const { showUndoRedo } = useStudioPreferencesStore(
    useShallow((state) => ({
      showUndoRedo: state.studioPreferences.showUndoRedo,
    })),
  );

  return (
    <>
      {showUndoRedo && (
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
