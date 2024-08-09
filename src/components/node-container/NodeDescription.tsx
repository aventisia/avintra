import { cn } from "@/react-toolkit/lib/utils";

export const NodeDescription = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "grow truncate text-left text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
