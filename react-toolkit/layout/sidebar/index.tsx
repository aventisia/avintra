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
        "z-20 after:absolute after:inset-0 after:-mr-4 after:bg-texture-white after:bg-contain after:bg-fixed after:bg-[center_-20rem] after:bg-no-repeat after:content-['']",
        // "inset-0 bg-texture-white bg-contain bg-fixed bg-[center_-20rem] bg-no-repeat",
      )}
    >
      <div
        className={cn(
          // "bg-gradient-to-b from-theme-1 to-theme-2",
          "fixed left-0 top-[--header-height] z-10 h-[calc(100vh-var(--header-height))] border-r py-1 transition-[width] duration-500",
          className,
          sidebarExpand ? "w-[--sidebar-max-width]" : "w-[--sidebar-min-width]",
          "",
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
    </div>
  );
};

export { Sidebar };
