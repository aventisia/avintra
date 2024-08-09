import { cn } from "@/react-toolkit/lib/utils";
import { Badge } from "@/react-toolkit/ui/badge";

export const NodeCategory = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Badge>) => {
  return (
    <Badge
      className={cn(
        "bg-slate-200 px-2 py-0.5 text-2xs font-medium text-slate-500",
        className,
      )}
      {...props}
    >
      {children}
    </Badge>
  );
};
