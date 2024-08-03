import { cn } from "@/react-toolkit/lib/utils";

export const TTSLabel = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2
      className={cn(
        "flex items-center text-xs font-medium text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
};
