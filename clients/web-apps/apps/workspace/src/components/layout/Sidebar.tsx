import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { AvailableCredits } from "@/features/available-credits/AvailableCredits.ee";
import { SidebarAccountMenu } from "@/react-toolkit/features/user-account/SidebarAccountMenu";

import { AppLogo } from "./AppLogo";
import { SidebarBrandingFooter } from "./SidebarBrandingFooter";
import { SidebarNav } from "./SidebarNav";
import { SpaceSelector } from "./SpaceSelector";

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
 * - Full-height column holding the brand and space selector, the menu, the credits, the account
 *   menu, and the branding footer.
 * - The sidebar's state (expanded or collapsed) is managed using `useBaseLayoutStore`.
 * - Width transitions smoothly between `--sidebar-min-width` and `--sidebar-max-width`.
 *
 * @example
 * ```tsx
 * <Sidebar className="custom-sidebar-class" />
 * ```
 */
const Sidebar = ({ className }: SidebarProps) => {
  const { sidebarExpand, setSidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
      setSidebarExpand: state.setSidebarExpand,
    })),
  );

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const isCommercial = userSession?.deploymentType == "Commercial";

  return (
    <aside
      className={cn(
        "relative z-10 hidden h-full shrink-0 border-r border-line bg-bg transition-[width] duration-200 motion-reduce:transition-none md:flex md:flex-col",
        className,
        sidebarExpand ? "w-[--sidebar-max-width]" : "w-[--sidebar-min-width]",
      )}
    >
      <div
        className={cn("flex h-14 shrink-0 items-center", sidebarExpand ? "px-4" : "justify-center")}
      >
        {sidebarExpand ? <AppLogo /> : <AppLogo iconOnly className="size-6" />}
      </div>
      {sidebarExpand && <SpaceSelector showLabel className="px-2.5 pb-1.5" />}
      <Tooltip content={sidebarExpand ? "Collapse" : "Expand"} side="right">
        <Button
          variant="ghost"
          size="icon5"
          aria-label={sidebarExpand ? "Collapse sidebar" : "Expand sidebar"}
          className="absolute -right-2.5 top-[18px] z-10 rounded-full border border-line bg-bg text-muted-foreground shadow-none hover:border-line-strong hover:bg-bg hover:text-ink"
          onClick={() => setSidebarExpand(!sidebarExpand)}
        >
          {sidebarExpand ? (
            <CaretLeftIcon className="h-3 w-3" />
          ) : (
            <CaretRightIcon className="h-3 w-3" />
          )}
        </Button>
      </Tooltip>

      <ScrollArea className="flex-1 py-1">
        <nav className="h-auto">
          <SidebarNav />
        </nav>
      </ScrollArea>

      {isCommercial && sidebarExpand && (
        <div className="px-2.5 pt-2">
          <AvailableCredits />
        </div>
      )}
      <div className="px-2.5 py-2">
        <SidebarAccountMenu />
      </div>
      {isCommercial && sidebarExpand && <SidebarBrandingFooter />}
    </aside>
  );
};

export { Sidebar };
