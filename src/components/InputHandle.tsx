import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

interface InputHandleProps {
  handlePosition?: Position;
}

export const InputHandle = memo(({
  handlePosition = Position.Bottom,
}: InputHandleProps) => {
  return (
    <Handle
      type={"target"}
      position={handlePosition}
      className="z-[5] h-[0.6rem] w-[0.6rem] rounded-full border-slate-400 bg-white"
    />
  );
});
