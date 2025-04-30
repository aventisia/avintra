import { UpgradeCard } from "@/react-toolkit/layout/sidebar/UpgradeCard";
import { SidebarMenuItems } from "@/react-toolkit/layout/sidebar/menu-items/SidebarMenuItems";
import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { IAppConfig } from "@/react-toolkit/types/app-config";

import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid";
import PerfectScrollbar from "react-perfect-scrollbar";

interface SidebarProps {
  appConfig: IAppConfig;
  className?: string;
}

const Sidebar = ({ appConfig, className }: SidebarProps) => {
  const { sidebarExpand, setSidebarExpand } = useBaseLayoutStore();

  return (
    <div
      className={cn(
        "fixed left-0 top-[calc(var(--header-height)+var(--header-padding))] z-10 h-[calc(100vh-var(--header-height)-var(--header-padding))] border-r py-1 transition-[width] duration-500",
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
      <PerfectScrollbar>
        <nav className="h-auto">
          <SidebarMenuItems
            sideNavMenuSections={appConfig?.navData.sideNavMenuSections}
          />
          {appConfig.showUpgradeCard && <UpgradeCard />}
        </nav>
      </PerfectScrollbar>
    </div>
  );
};

export { Sidebar };
