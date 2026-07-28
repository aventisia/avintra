import { cn } from "@avplatform/ui/lib";

export const NodeHeading = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2
      className={cn(
        "absolute top-16 w-20 line-clamp-2 text-center text-2xs font-medium text-slate-900",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
};
