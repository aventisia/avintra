import { cn } from "@avplatform/ui/lib";

export const NodeHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)} {...props}>
      {children}
    </div>
  );
};
