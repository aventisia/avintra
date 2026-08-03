import { cn } from "@avplatform/ui/lib";
import { Handle, Position, useNodeConnections } from "@xyflow/react";

interface InputHandleProps {
  id?: string;

  position?: Position;

  connectionCount?: number;

  className?: string;
}

export const InputHandle = ({
  id,

  position = Position.Left, //  Changed to Left for LR flow

  connectionCount = 1,

  className,
}: InputHandleProps) => {
  const connections = useNodeConnections({
    handleType: "target",
  });

  return (
    <Handle
      id={id}
      type={"target"}
      position={position}
      isConnectable={connections.length < connectionCount}
      // Added !transform-none and !left-0 to lock it perfectly over the node
      className={cn("!left-0 top-0 h-full w-full !transform-none rounded-lg opacity-0", className)}
    />
  );
};
