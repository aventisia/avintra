import { cn } from "@avplatform/ui/lib";
import { Tabs } from "@avplatform/ui/tabs";

export const DCPTabsWrapper = ({
  tabValue,
  children,
  setTabValue,
  className,
  defaultValue,
}: {
  tabValue: string;
  setTabValue: (selectedTab: string) => void;
  children: React.ReactNode;
  className?: string;
  defaultValue?: string;
}) => {
  return (
    <Tabs
      onValueChange={setTabValue}
      className={cn("flex min-h-0 w-full flex-1 flex-col", className)}
      defaultValue={defaultValue}
      value={tabValue}
    >
      {children}
    </Tabs>
  );
};
