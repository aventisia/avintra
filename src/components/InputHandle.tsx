import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

export const InputHandle = memo(() => {
  return (
    <Handle
      type={"target"}
      position={Position.Top}
      className="z-[5] h-[0.6rem] w-[0.6rem] rounded-full border-slate-400 bg-white"
    />
  );
});
