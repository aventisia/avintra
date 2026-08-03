import { MiniMap } from "@xyflow/react";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";

export const MiniMapExt = memo(() => {
  // Get Studio Preferences store state
  const { miniMap } = useStudioPreferencesStore(
    useShallow((state) => ({
      miniMap: state.studioPreferences.miniMap,
    })),
  );

  return (
    <>
      {miniMap && (
        <div onContextMenu={(e) => e.preventDefault()}>
          <MiniMap ariaLabel={null} className="rounded-lg bg-white" zoomable pannable />
        </div>
      )}
    </>
  );
});
