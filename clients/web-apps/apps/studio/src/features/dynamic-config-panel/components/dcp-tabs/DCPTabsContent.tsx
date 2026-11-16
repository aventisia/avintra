import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { TabsContent } from "@avplatform/ui/tabs";

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
    <TabsContent className="mt-0 flex min-h-0 flex-1 flex-col" value={tabValue}>
      <ScrollArea className={cn("min-h-0 flex-1 px-3 pb-2", className)}>
        <div className="px-1 pt-1.5">{children}</div>
      </ScrollArea>
      {footer}
    </TabsContent>
  );
};
