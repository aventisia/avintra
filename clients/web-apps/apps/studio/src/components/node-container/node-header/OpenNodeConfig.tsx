import { useShallow } from "zustand/react/shallow";

import { useDCPNavigationGuard, useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { NodeDataType } from "@/types/node-data-type";

interface OpenNodeConfigProps {
  nodeId: string;
  nodeData: NodeDataType;
  children?: React.ReactNode;
}

export const OpenNodeConfig = ({ nodeId, nodeData, children }: OpenNodeConfigProps) => {
  // Get state and actions from the DynamicConfigPanel store
  const { openNodeConfig } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      openNodeConfig: state.openNodeConfig,
    })),
  );

  // Guarded: switching nodes flushes pending edits first, aborts on validation errors
  const guardNavigation = useDCPNavigationGuard();

  return (
    // Do not use DialogTrigger to open the dialog. It creats focus issue due to multiple DialogTriggers
    <button
      className="relative flex h-full w-full items-center justify-center rounded-lg"
      onDoubleClick={() => {
        // Always open (never toggle): double-clicking another node while the
        // panel is open must switch content, not close the panel.
        void guardNavigation(() => openNodeConfig(nodeId, nodeData));
      }}
    >
      {children}
    </button>
  );
};
