import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { MiniMap } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

export const MiniMapExt = () => {
  // Get Studio Preferences store state
  const { showMiniMap } = useStudioPreferencesStore(
    useShallow((state) => ({
      showMiniMap: state.studioPreferences.showMiniMap,
    })),
  );

  return (
    <>
      {showMiniMap && (
        <div onContextMenu={(e) => e.preventDefault()}>
          <MiniMap
            ariaLabel={null}
            className="rounded-lg bg-white"
            zoomable
            pannable
          />
        </div>
      )}
    </>
  );
};
