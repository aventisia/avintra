import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { TabsContent } from "@aventisia/ui/tabs";

export const DCPTabsContent = ({
  tabValue,
  children,
  footer,
  className,
}: {
  tabValue: string;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  return (
    <TabsContent className="mt-0" value={tabValue}>
      <ScrollArea
        className={cn(
          "h-[calc(100vh-3*4rem-var(--header-height)-3*var(--header-padding))] px-3 pb-2",
          className,
        )}
      >
        <div className="px-1">{children}</div>
      </ScrollArea>
      {footer}
    </TabsContent>
  );
};
