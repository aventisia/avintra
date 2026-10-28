import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { TabsContent } from "@avplatform/ui/tabs";

export const DCPTabsContent = ({
  tabValue,
  children,
  footer,
  className,
  hasFooter = true,
}: {
  tabValue: string;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hasFooter?: boolean;
}) => {
  return (
    <TabsContent className="mt-0" value={tabValue}>
      <ScrollArea
        className={cn(
          // Derived from the wrapper height above: minus tab-list (2.5rem), and
          // minus footer (3.5rem) when present.
          "h-[calc(100vh-6.5rem-var(--header-height)-var(--header-padding)-1rem)] px-3 pb-2",
          hasFooter && "h-[calc(100vh-10rem-var(--header-height)-var(--header-padding)-1rem)]",
          className,
        )}
      >
        <div className="px-1 pt-4">{children}</div>
      </ScrollArea>
      {footer}
    </TabsContent>
  );
};
