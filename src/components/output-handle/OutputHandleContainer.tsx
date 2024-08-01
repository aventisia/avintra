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
      "-bottom-[2.1rem] items-end justify-center left-1/2 h-[2.1rem] -translate-x-1/2",
    [Position.Top]:
      "-top-[2.2rem] items-start justify-center left-1/2 h-[2.2rem] -translate-x-1/2",
    [Position.Right]:
      "-right-[2.2rem] items-center justify-end top-1/2 w-[2.2rem] -translate-y-1/2",
    [Position.Left]:
      "-left-[2.2rem] items-center justify-start top-1/2 w-[2.2rem] -translate-y-1/2",
  };

  return (
    <div className={cn("absolute flex", positionLookup[handlePosition])}>
      {children}
    </div>
  );
};
