import { cn } from "@/ui/lib";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-fill motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export { Skeleton };
