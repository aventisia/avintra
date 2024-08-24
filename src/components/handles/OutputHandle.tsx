import { cn } from "@/react-toolkit/lib/utils";
import { Handle, Position } from "@xyflow/react";

interface OutputHandleProps {
  position?: Position;
  className?: string;
}

export const OutputHandle = ({
  position = Position.Bottom,
  className,
}: OutputHandleProps) => {
  return (
    <Handle
      type="source"
      position={position}
      isConnectable={false}
      className={cn(
        "z-[5] h-[0.6rem] w-[0.6rem] rounded-full border-indigo-500 bg-indigo-400",
        className,
      )}
    />
  );
};
