import { cn } from "@/react-toolkit/lib/utils";

interface NodeContainerProps {
  /** Flag to indicate if the node is selected. */
  selected?: boolean;

  /** The children to be rendered inside the container. */
  children: React.ReactNode;
}

/**
 * Renders a container for a node in the flow builder.
 *
 * @param {boolean} props.selected - Indicates whether the node is selected.
 * @param {ReactNode} props.children - The content to be rendered inside the container.
 */
export const NodeContainer = ({ selected, children }: NodeContainerProps) => {
  return (
    <div
      className={cn(
        "relative flex h-auto w-[18rem] flex-col gap-2 rounded-lg border bg-white px-4 py-3.5",
        selected ? "border-primary" : "border-slate-300",
      )}
    >
      {children}
    </div>
  );
};
