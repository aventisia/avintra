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
      className={cn(
        "rounded-full py-1.5 text-xs font-medium leading-3 outline-none data-[state=active]:text-primary data-[state=active]:shadow-sm",
        className,
      )}
      onClick={handleClick}
    >
      {children}
    </TabsTrigger>
  );
};
