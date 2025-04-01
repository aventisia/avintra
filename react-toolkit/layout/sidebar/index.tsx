import { UpgradeCard } from "@/react-toolkit/layout/sidebar/UpgradeCard";
import { SidebarMenuItems } from "@/react-toolkit/layout/sidebar/menu-items/SidebarMenuItems";
import { cn } from "@/react-toolkit/lib/utils";
import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { IAppConfig } from "@/react-toolkit/types/app-config";
import PerfectScrollbar from "react-perfect-scrollbar";

interface SidebarProps {
  appConfig: IAppConfig;
  className?: string;
}

const Sidebar = ({ appConfig, className }: SidebarProps) => {
  const { sidebarExpand } = useBaseLayoutStore();

  return (
    <div
      className={cn(
        "fixed left-0 top-[calc(var(--header-height)+var(--header-padding))] z-10 h-[calc(100vh-var(--header-height)-var(--header-padding))] border-r py-1 transition-[width] duration-500",
        className,
        sidebarExpand ? "w-[--sidebar-max-width]" : "w-[--sidebar-min-width]",
      )}
    >
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

