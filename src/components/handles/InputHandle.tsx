import { cn } from "@/react-toolkit/lib/utils";
import { Handle, Position } from "@xyflow/react";

interface InputHandleProps {
  position?: Position;
  className?: string;
}

export const InputHandle = ({
  position = Position.Top,
  className,
}: InputHandleProps) => {
  return (
    <Handle
      type={"target"}
      position={position}
      isConnectable={false}
      className={cn(
        "z-[5] h-[0.6rem] w-[0.6rem] rounded-full border-slate-400 bg-white",
        className,
      )}
    />
  );
};
