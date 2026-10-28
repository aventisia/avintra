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
      className={cn(
        // Fits the fixed Panel body: panel height minus the 4rem DCP header.
        // (Panel root is h-[calc(100vh-var(--header-height)-var(--header-padding)-1rem)].)
        "h-[calc(100vh-4rem-var(--header-height)-var(--header-padding)-1rem)] w-full",
        className,
      )}
      defaultValue={defaultValue}
      value={tabValue}
    >
      {children}
    </Tabs>
  );
};
