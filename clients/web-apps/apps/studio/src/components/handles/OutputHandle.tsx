import { cn } from "@avplatform/ui/lib";
import { Handle, Position, useNodeConnections } from "@xyflow/react";

interface OutputHandleProps {
  id?: string;

  position?: Position;

  connectionCount?: number;

  className?: string;
}

export const OutputHandle = ({
  id,

  position = Position.Right, //  Changed to Right for LR flow

  connectionCount = 1,

  className,
}: OutputHandleProps) => {
  const connections = useNodeConnections({
    handleType: "source",
  });

  return (
    <Handle
      id={id}
      type="source"
      position={position}
      isConnectable={connections.length < connectionCount}
      className={cn(
        "z-[5] h-1.5 w-1.5 rounded-full border-primary bg-primary",

        className,
      )}
    />
  );
};
