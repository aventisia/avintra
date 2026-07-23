import { cn } from "@avplatform/ui/lib";
import { ScrollArea, ScrollBar } from "@avplatform/ui/scroll";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { type PropsWithChildren } from "react";
import { useShallow } from "zustand/react/shallow";

type HorizontalScrollWrapperProps = PropsWithChildren<{
  /**
   * Additional class names to be merged with the default responsive width.
   */
  className?: string;
}>;

/**
 * A reusable wrapper that provides horizontal scrolling for wide content such as
 * data tables. The wrapper automatically adjusts its width based on the current
 * sidebar state so that the scrollable area always fits within the available
 * viewport.
 *
 * @param props - Component props.
 * @param props.children - The content to render inside the scroll area.
 * @param props.className - Optional additional classes for the scroll area.
 *
 * @example
 * ```tsx
 * <HorizontalScrollWrapper>
 *   <DataTable table={table} columnsLength={columns.length} />
 * </HorizontalScrollWrapper>
 * ```
 */
export function HorizontalScrollWrapper({ children, className }: HorizontalScrollWrapperProps) {
  // Read only the sidebar expansion state to avoid unnecessary re-renders.
  const { sidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
    })),
  );

  return (
    <ScrollArea
      className={cn(
        // Dynamically size the scroll area based on the current sidebar width.
        sidebarExpand
          ? "md:w-[calc(100vw-var(--sidebar-max-width)-3.5rem)]"
          : "md:w-[calc(100vw-var(--sidebar-min-width)-3.5rem)]",
        className,
      )}
    >
      {/* Render the consumer's content inside the scrollable area. */}
      {children}

      {/* Always render a horizontal scrollbar for overflowing content. */}
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
