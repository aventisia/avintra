import { Separator } from "@/react-toolkit/ui/separator";
import { Panel } from "@xyflow/react";
import { FCBContainer } from "./FCBContainer";
import { FCBRedo } from "./FCBRedo";
import { FCBUndo } from "./FCBUndo";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { useShallow } from "zustand/react/shallow";

export const FlowControls = () => {
  // Get Studio Preferences store state
  const { hideUndoRedo } = useStudioPreferencesStore(
    useShallow((state) => ({
      hideUndoRedo: state.studioPreferences.hideUndoRedo,
    })),
  );

  return (
    <>
      {!hideUndoRedo && (
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
