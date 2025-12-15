import { cn } from "@aventisia/ui/lib";
import { TabsTrigger } from "@aventisia/ui/tabs";

export const DCPTabsTrigger = ({
  tabValue,
  className,
  children,
}: {
  tabValue: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <TabsTrigger
      value={tabValue}
      className={cn(
        "rounded-full py-1.5 text-xs font-medium leading-3 outline-none data-[state=active]:text-primary data-[state=active]:shadow-sm",
        className,
      )}
    >
      {children}
    </TabsTrigger>
  );
};
