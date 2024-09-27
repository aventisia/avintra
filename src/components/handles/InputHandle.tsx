import { cn } from "@/react-toolkit/lib/utils";
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
      className={cn(
        "z-[5] h-[0.6rem] w-[0.6rem] rounded-full border-slate-300 bg-white",
        className,
      )}
    />
  );
};
