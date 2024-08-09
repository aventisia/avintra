import { cn } from "@/react-toolkit/lib/utils";

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
        "relative flex h-auto w-[20rem] flex-col gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3.5",
        className,
        selected && "border-primary",
      )}
      {...props}
    >
      {children}
    </div>
  );
};
