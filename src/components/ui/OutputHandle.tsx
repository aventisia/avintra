import { Handle, Position } from "@xyflow/react";

export const OutputHandle = () => {
  return (
    <Handle
      type={"source"}
      position={Position.Bottom}
      className="z-[5] h-2.5 w-2.5 rounded-full border-slate-400 bg-indigo-500"
    />
  );
};
