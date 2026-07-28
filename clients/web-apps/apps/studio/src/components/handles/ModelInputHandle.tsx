import { cn } from "@avplatform/ui/lib";
import { Handle, Position, useHandleConnections } from "@xyflow/react";

export const ModelInputHandle = ({
  isConnectable,
}: {
  isConnectable: boolean;
}) => {
  const connections = useHandleConnections({
    type: "target",
  });

  return (
    <Handle
      position={Position.Bottom}
      id="model-node"
      type="target"
      isConnectable={isConnectable && connections.length < 1}
      className={cn(
        "z-[5] h-1.5 w-1.5 rounded-full border-indigo-500 bg-indigo-400 bottom-0 left-24",
        !isConnectable && "opacity-0",
      )}
    />
  );
};
