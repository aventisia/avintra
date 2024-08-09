import { cn } from "@/react-toolkit/lib/utils";

export const NodeHeading = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2
      className={cn(
        "grow truncate text-left text-sm font-medium text-slate-900",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
};
