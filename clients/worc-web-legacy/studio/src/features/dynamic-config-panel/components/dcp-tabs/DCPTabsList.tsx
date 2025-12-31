import { cn } from "@aventisia/ui/lib";
import { TabsList } from "@aventisia/ui/tabs";

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
