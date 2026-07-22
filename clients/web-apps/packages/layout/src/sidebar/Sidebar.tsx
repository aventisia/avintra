import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from "@heroicons/react/24/solid";
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
        "fixed left-0 z-10 hidden border-r py-1 transition-[width] duration-500 md:block",
        appBanner
          ? "top-[calc(var(--header-height)+var(--header-padding)+var(--banner-height))] h-[calc(100vh-var(--header-height)-var(--header-padding)-var(--banner-height))]"
          : "top-[calc(var(--header-height)+var(--header-padding))] h-[calc(100vh-var(--header-height)-var(--header-padding))]",
        className,
        sidebarExpand ? "w-[--sidebar-max-width]" : "w-[--sidebar-min-width]",
      )}
    >
      <Tooltip content={sidebarExpand ? "Collapse" : "Expand "} side="right">
        <Button
          variant="ghost"
          size="icon5"
          className="absolute -right-2.5 top-2 z-10 rounded-full border-none bg-white text-indigo-100 shadow-none hover:text-primary"
          onClick={() => setSidebarExpand(!sidebarExpand)}
        >
          {sidebarExpand ? (
            <ArrowLeftCircleIcon className="h-5 w-5" />
          ) : (
            <ArrowRightCircleIcon className="h-5 w-5" />
          )}
        </Button>
      </Tooltip>
      <ScrollArea
        className={cn(
          appBanner
            ? "h-[calc(100vh-var(--header-height)-var(--header-padding)-var(--banner-height)-0.6rem)]"
            : "h-[calc(100vh-var(--header-height)-var(--header-padding)-0.6rem)]",
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
