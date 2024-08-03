import { cn } from "@/react-toolkit/lib/utils";

export const TTSDescription = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={cn(
        "w-[90%] truncate text-2xs text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
};
