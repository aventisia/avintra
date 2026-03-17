import { cn } from "@aventisia/ui/lib";
import { Tabs } from "@aventisia/ui/tabs";

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
      className={cn(
        "h-[calc(100vh-4rem-var(--header-height)-3*var(--header-padding))] w-full rounded-b-xl",
        className,
      )}
      defaultValue={defaultValue}
      value={tabValue}
    >
      {children}
    </Tabs>
  );
};
