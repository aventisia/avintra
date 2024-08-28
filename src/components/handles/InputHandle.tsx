import { cn } from "@/react-toolkit/lib/utils";
import { Handle, Position, useHandleConnections } from "@xyflow/react";

interface InputHandleProps {
  position?: Position;
  connectionCount?: number;
  className?: string;
}

export const InputHandle = ({
  position = Position.Top,
  connectionCount = 1,
  className,
}: InputHandleProps) => {
  const connections = useHandleConnections({
    type: "target",
  });

  return (
    <Handle
      type={"target"}
      position={position}
      isConnectable={connections.length < connectionCount}
      className={cn(
        "z-[5] h-[0.6rem] w-[0.6rem] rounded-full border-slate-300 bg-white",
        className,
      )}
    />
  );
};
