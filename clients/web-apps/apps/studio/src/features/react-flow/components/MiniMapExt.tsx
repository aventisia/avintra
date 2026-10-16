import { FlowTypesEnum } from "@avplatform/ui/enums";
import { MiniMap } from "@xyflow/react";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";

export const MiniMapExt = memo(() => {
  // Get Studio Preferences store state
  const { miniMap } = useStudioPreferencesStore(
    useShallow((state) => ({
      miniMap: state.studioPreferences.miniMap,
    })),
  );
  const flowType = useReactFlowExtStore((state) => state.flowType);

  // ChatAgent and VoiceAgent have a fixed single node — minimap adds no value.
  if (flowType === FlowTypesEnum.ChatAgent || flowType === FlowTypesEnum.VoiceAgent) return null;

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
