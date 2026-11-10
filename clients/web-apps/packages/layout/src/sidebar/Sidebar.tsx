import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { UpgradeCard } from "./UpgradeCard";
import { SidebarMenuItems } from "./menu-items";

interface SidebarProps {
  className?: string;
}

/**
 * Sidebar component that provides a collapsible navigation menu.
 *
 * @param {SidebarProps} props - The properties for the Sidebar component.
 * @param {string} props.className - Additional CSS classes to apply to the sidebar.
 *
 * @returns {JSX.Element} The rendered Sidebar component.
 *
 * @remarks
 * - The sidebar's state (expanded or collapsed) is managed using the `useBaseLayoutStore` hook.
 * - The width of the sidebar transitions smoothly based on its state.
 * - Includes a button to toggle the sidebar's state, with an icon indicating the current state.
 * - Contains navigation menu items and an upgrade card wrapped in a scrollable container.
 *
 * @example
 * ```tsx
 * <Sidebar className="custom-sidebar-class" />
 * ```
 */
const Sidebar = ({ className }: SidebarProps) => {
  // Get the state of the sidebar from the store
  const { sidebarExpand, appBanner, setSidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
      appBanner: state.appBanner,
      setSidebarExpand: state.setSidebarExpand,
    })),
  );

  // Return the sidebar component
  return (
    <div
      className={cn(
        "fixed left-0 z-10 hidden border-r border-line bg-bg py-3 transition-[width] duration-[120ms] ease-out motion-reduce:transition-none md:block",
        appBanner
          ? "top-[calc(var(--header-height)+var(--header-padding)+var(--banner-height))] h-[calc(100vh-var(--header-height)-var(--header-padding)-var(--banner-height))]"
          : "top-[calc(var(--header-height)+var(--header-padding))] h-[calc(100vh-var(--header-height)-var(--header-padding))]",
        className,
        sidebarExpand ? "w-[--sidebar-max-width]" : "w-[--sidebar-min-width]",
      )}
    >
      <Tooltip content={sidebarExpand ? "Collapse" : "Expand"} side="right">
        <Button
          variant="ghost"
          size="icon5"
          className="absolute -right-2.5 top-3 z-10 rounded-full border border-line bg-surface text-muted-foreground shadow-none hover:bg-hover hover:text-ink"
          onClick={() => setSidebarExpand(!sidebarExpand)}
        >
          {sidebarExpand ? (
            <CaretLeftIcon className="size-3.5" />
          ) : (
            <CaretRightIcon className="size-3.5" />
          )}
        </Button>
      </Tooltip>
      <ScrollArea
        className={cn(
          appBanner
            ? "h-[calc(100vh-var(--header-height)-var(--header-padding)-var(--banner-height)-1.5rem)]"
            : "h-[calc(100vh-var(--header-height)-var(--header-padding)-1.5rem)]",
        )}
      >
        <nav className="h-auto">
          <SidebarMenuItems />
          <UpgradeCard />
        </nav>
      </ScrollArea>
    </div>
  );
};

export { Sidebar };
