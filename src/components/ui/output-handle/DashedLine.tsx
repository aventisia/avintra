import { cn } from "@/react-toolkit/lib/utils";
import { Position } from "@xyflow/react";

interface DashedLineProps {
  handlePosition: Position;
}

export const DashedLine = ({ handlePosition }: DashedLineProps) => {
  const positionLookup = {
    [Position.Bottom]: "h-4 bottom-5",
    [Position.Top]: "h-4 top-5",
    [Position.Right]: "w-4 right-5",
    [Position.Left]: "w-4 left-5",
  };

  return (
    <span
      className={cn(
        "absolute border border-dashed border-slate-400",
        positionLookup[handlePosition],
      )}
    />
  );
};
