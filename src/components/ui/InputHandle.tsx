import { Handle, Position } from "@xyflow/react";

export const InputHandle = () => {
  return (
    <Handle
      type={"target"}
      position={Position.Top}
      className="z-[5] h-2.5 w-2.5 rounded-full border-slate-400 bg-slate-500"
    />
  );
};
