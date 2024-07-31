import { cn } from "@/react-toolkit/lib/utils";
import { Position } from "@xyflow/react";

interface OutputHandleContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  handlePosition: Position;
}

export const OutputHandleContainer = ({
  handlePosition,
  children,
}: OutputHandleContainerProps) => {
  const positionLookup = {
    [Position.Bottom]:
      "-bottom-10 items-end justify-center left-1/2 h-10 -translate-x-1/2",
    [Position.Top]:
      "-top-10 items-start justify-center left-1/2 h-10 -translate-x-1/2",
    [Position.Right]:
      "-right-10 items-center justify-end top-1/2 w-10 -translate-y-1/2",
    [Position.Left]:
      "-left-10 items-center justify-start top-1/2 w-10 -translate-y-1/2",
  };

  return (
    <div className={cn("absolute flex", positionLookup[handlePosition])}>
      {children}
    </div>
  );
};
