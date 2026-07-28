import { cn } from "@avplatform/ui/lib";
import { TabsList } from "@avplatform/ui/tabs";

export const DCPTabsList = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <TabsList className={cn("h-8 rounded-full px-1 ", className)}>
      {children}
    </TabsList>
  );
};
