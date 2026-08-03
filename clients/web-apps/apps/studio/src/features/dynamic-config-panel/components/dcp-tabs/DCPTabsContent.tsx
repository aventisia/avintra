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
          "h-[calc(100vh-2*4rem-var(--header-height)-3*var(--header-padding))] px-3 pb-2",
          hasFooter && "h-[calc(100vh-3*4rem-var(--header-height)-3*var(--header-padding))]",
          className,
        )}
      >
        <div className="px-1 pt-1">{children}</div>
      </ScrollArea>
      {footer}
    </TabsContent>
  );
};
