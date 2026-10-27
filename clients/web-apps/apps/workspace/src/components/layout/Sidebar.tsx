import { SidebarMenuItems } from "@avplatform/layout";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import { useShallow } from "zustand/react/shallow";

import { SidebarBrandingFooter } from "./SidebarBrandingFooter";

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
 * - The sidebar's state (expanded or collapsed) is managed using `useBaseLayoutStore`.
 * - Width transitions smoothly between `--sidebar-min-width` and `--sidebar-max-width`.
 * - Accounts for an optional app banner by adjusting top offset and height via CSS vars.
 * - `ScrollArea` grows to fill available space; `SidebarBrandingFooter` is pinned at the bottom.
 *
 * @example
 * ```tsx
 * <Sidebar className="custom-sidebar-class" />
 * ```
 */
const Sidebar = ({ className }: SidebarProps) => {
  const { sidebarExpand, appBanner, setSidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
      appBanner: state.appBanner,
      setSidebarExpand: state.setSidebarExpand,
    })),
  );

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Return the sidebar component
  return (
    <div
      className={cn(
        "fixed left-0 z-10 hidden border-r  transition-[width] duration-500 md:flex md:flex-col",
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
          className="absolute -right-2.5 top-2 z-10 rounded-full border-none bg-bg text-line-strong shadow-none hover:text-primary"
          onClick={() => setSidebarExpand(!sidebarExpand)}
        >
          {sidebarExpand ? (
            <ArrowLeftCircleIcon className="h-5 w-5" />
          ) : (
            <ArrowRightCircleIcon className="h-5 w-5" />
          )}
        </Button>
      </Tooltip>

      <ScrollArea className="flex-1 py-1">
        <nav className="h-auto">
          <SidebarMenuItems />
        </nav>
      </ScrollArea>

      {userSession?.deploymentType == "Commercial" && <SidebarBrandingFooter />}
    </div>
  );
};

export { Sidebar };
