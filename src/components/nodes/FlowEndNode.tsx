import { NodeProps } from "@xyflow/react";
import { InputHandle } from "../handles/InputHandle";
import { Goal } from "lucide-react";

export const FlowEndNode = ({ targetPosition }: NodeProps) => {
  return (
    <div className="flex w-36 h-11 items-center justify-center gap-2 rounded-lg border-2 border-indigo-300 bg-indigo-100 text-sm">
      <Goal className="h-4 w-4 stroke-[1.5] text-indigo-600" />
      <span>Flow complete</span>
      <InputHandle position={targetPosition} />
    </div>
  );
};
