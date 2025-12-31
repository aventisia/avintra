import { cn } from "@aventisia/ui/lib";
import { Handle, Position, useHandleConnections } from "@xyflow/react";

interface InputHandleProps {
  id?: string;
  position?: Position;
  connectionCount?: number;
  className?: string;
}

export const InputHandle = ({
  id,
  position = Position.Top,
  connectionCount = 1,
  className,
}: InputHandleProps) => {
  const connections = useHandleConnections({
    type: "target",
  });

  return (
    <Handle
      id={id}
      type={"target"}
      position={position}
      isConnectable={connections.length < connectionCount}
      className={cn("top-1/2 h-full w-full rounded-lg opacity-0", className)}
    />
  );
};
