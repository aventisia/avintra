import { cn } from "@avplatform/ui/lib";
import { TabsTrigger } from "@avplatform/ui/tabs";

export const DCPTabsTrigger = ({
  tabValue,
  className,
  children,
  handleClick,
}: {
  tabValue: string;
  children: React.ReactNode;
  className?: string;
  handleClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
}) => {
  return (
    <TabsTrigger
      value={tabValue}
      className={cn("h-8 data-[state=active]:after:-bottom-px", className)}
      onClick={handleClick}
    >
      {children}
    </TabsTrigger>
  );
};
