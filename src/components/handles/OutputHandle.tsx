import { cn } from "@/react-toolkit/lib/utils";
import { Handle, Position, useHandleConnections } from "@xyflow/react";

interface OutputHandleProps {
  position?: Position;
  connectionCount?: number;
  className?: string;
}

export const OutputHandle = ({
  position = Position.Bottom,
  connectionCount = 1,
  className,
}: OutputHandleProps) => {
  const connections = useHandleConnections({
    type: "source",
  });

  return (
    <Handle
      type="source"
      position={position}
      isConnectable={connections.length < connectionCount}
      className={cn(
        "z-[5] h-[0.6rem] w-[0.6rem] rounded-full border-indigo-500 bg-indigo-400",
        className,
      )}
    />
  );
};
