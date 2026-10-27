import { cn } from "@/ui/lib";

interface DotSeparatorProps {
  className?: string;
}

const DotSeparator = ({ className }: DotSeparatorProps) => {
  return (
    <span className={cn("mx-2 -mt-3.5 text-[1.5rem] text-muted-foreground", className)}>.</span>
  );
};

export { DotSeparator };
