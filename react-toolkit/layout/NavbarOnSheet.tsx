import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { UpgradeCard } from "@/react-toolkit/layout/sidebar/UpgradeCard";
import { SidebarMenuItems } from "@/react-toolkit/layout/sidebar/menu-items/SidebarMenuItems";
import { cn } from "@/react-toolkit/lib/utils";
import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { IAppConfig } from "@/react-toolkit/types/app-config";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Sheet, SheetContent, SheetTrigger } from "@/react-toolkit/ui/sheet";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
import PerfectScrollbar from "react-perfect-scrollbar";

interface NavbarOnSheetProps {
  appConfig: IAppConfig;
  className?: string;
}

const NavbarOnSheet = ({ appConfig, className }: NavbarOnSheetProps) => {
  const { navbarOnSheetOpen, setNavbarOnSheetOpen, setSidebarExpand } =
    useBaseLayoutStore();

  return (
    <Sheet
      open={navbarOnSheetOpen}
      onOpenChange={() => setNavbarOnSheetOpen(!navbarOnSheetOpen)}
    >
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon8"
          className={cn(
            "mr-3.5 h-8 w-8 rounded-lg border-none bg-transparent text-white/70 shadow-none hover:bg-white/10 hover:text-white/70",
            className,
          )}
          onClick={() => setSidebarExpand(true)}
        >
          <Bars3BottomLeftIcon className="h-7 w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[--sidebar-max-width]">
        <PerfectScrollbar>
          <div className="flex h-[--header-height] items-center p-[1.1rem]">
            <AppLogo lightLogo={false} />
          </div>
          <nav className="h-auto">
            <SidebarMenuItems
              sideNavMenuSections={appConfig.navData.sideNavMenuSections}
            />
            {appConfig.showUpgradeCard && <UpgradeCard />}
          </nav>
        </PerfectScrollbar>
      </SheetContent>
    </Sheet>
  );
};

export { NavbarOnSheet };

