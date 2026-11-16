import { cn } from "@avplatform/ui/lib";
import { SEGMENTED_TABS_TRIGGER_CLASS, TabsTrigger } from "@avplatform/ui/tabs";

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
      className={cn(SEGMENTED_TABS_TRIGGER_CLASS, className)}
      onClick={handleClick}
    >
      {children}
    </TabsTrigger>
  );
};
