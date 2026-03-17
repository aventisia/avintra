import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { NodeDataType } from "@/types/node-data-type";

import { useShallow } from "zustand/react/shallow";

interface OpenNodeConfigProps {
  nodeId: string;
  nodeData: NodeDataType;
  children?: React.ReactNode;
}

export const OpenNodeConfig = ({
  nodeId,
  nodeData,
  children,
}: OpenNodeConfigProps) => {
  // Get state and actions from the DynamicConfigPanel store
  const { showDialog, setShowDialog, setNodeId, setNodeData } =
    useDynamicConfigPanelStore(
      useShallow((state) => ({
        showDialog: state.showDialog,
        setNodeId: state.setNodeId,
        setShowDialog: state.setShowDialog,
        setNodeData: state.setNodeData,
      })),
    );

  return (
    // Do not use DialogTrigger to open the dialog. It creats focus issue due to multiple DialogTriggers
    <button
      className="relative flex h-full w-full items-center justify-center rounded-lg"
      onDoubleClick={() => {
        setShowDialog(!showDialog);
        setNodeId(nodeId);
        setNodeData(nodeData);
      }}
    >
      {children}
    </button>
  );
};
