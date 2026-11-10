import { cn } from "@avplatform/ui/lib";

export const NodeHeading = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2
      className={cn(
        "absolute top-[4.5rem] w-20 line-clamp-2 text-center text-2xs font-medium text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
};
