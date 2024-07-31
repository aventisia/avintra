import { cn } from "@/react-toolkit/lib/utils";

interface NodeContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Flag to indicate if the node is selected. */
  selected?: boolean;
}

/**
 * Renders a container for a node in the flow builder.
 */
export const NodeContainer = ({ selected, children }: NodeContainerProps) => {
  return (
    <div
      className={cn(
        "group relative flex h-auto w-[18rem] flex-col gap-2 rounded-lg border bg-white px-4 py-3.5",
        selected ? "border-primary" : "border-slate-300",
      )}
    >
      {children}
    </div>
  );
};
