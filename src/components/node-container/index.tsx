import { cn } from "@/react-toolkit/lib/utils";
import { GripVertical } from "lucide-react";

interface NodeContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
}

export const NodeContainer = ({
  selected = false,
  className,
  children,
  ...props
}: NodeContainerProps) => {
  return (
    <div
      className={cn(
        "relative flex h-[5.3rem] rounded-lg border border-slate-300",
        className,
        selected && "ring-2 ring-ring ring-offset-1 ring-offset-slate-200",
      )}
      {...props}
    >
      <div className="custom-drag-handle flex items-center justify-center h-full w-5 rounded-l-lg bg-slate-100">
        <GripVertical className="h-5 w-5 text-slate-300" />
      </div>
      <div className="flex w-[20rem] grow flex-col gap-2 rounded-r-lg bg-white px-4 py-3.5">
        {children}
      </div>
    </div>
  );
};
