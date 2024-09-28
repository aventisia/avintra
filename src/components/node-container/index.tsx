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
        "flex h-[5.3rem] w-[19.375rem] rounded-lg border border-slate-300",
        className,
        selected && "border-primary ring-1 ring-ring",
      )}
      {...props}
    >
      <div className="custom-drag-handle flex h-full w-5 items-center justify-center rounded-l-lg bg-slate-100">
        <GripVertical className="h-5 w-5 text-slate-300" />
      </div>
      <div className="flex w-[18rem] grow flex-col gap-2 rounded-r-lg bg-white px-4 pb-3.5 pt-[0.7rem]">
        {children}
      </div>
    </div>
  );
};
