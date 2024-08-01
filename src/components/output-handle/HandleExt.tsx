import { Handle, Position } from "@xyflow/react";

interface HandleExtProps {
  handlePosition: Position;
}

export const HandleExt = ({ handlePosition }: HandleExtProps) => {
  return (
    <Handle
      type="source"
      position={handlePosition}
      className="z-[5] h-[0.6rem] w-[0.6rem] rounded-full border-indigo-500 bg-indigo-500"
    />
  );
};
