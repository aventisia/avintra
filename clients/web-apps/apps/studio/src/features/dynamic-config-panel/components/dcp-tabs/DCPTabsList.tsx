import { cn } from "@avplatform/ui/lib";
import { TabsList } from "@avplatform/ui/tabs";

export const DCPTabsList = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <TabsList className={cn("h-8 gap-4 border-b-0", className)}>{children}</TabsList>;
};
