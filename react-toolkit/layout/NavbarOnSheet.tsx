import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { UpgradeCard } from "@/react-toolkit/layout/sidebar/UpgradeCard";
import { SidebarMenuItems } from "@/react-toolkit/layout/sidebar/menu-items/SidebarMenuItems";
import { cn } from "@aventisia/ui/lib";
import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { IAppConfig } from "@/react-toolkit/types/app-config";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@aventisia/ui/dialog";
import { Bars3BottomLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import PerfectScrollbar from "react-perfect-scrollbar";

interface NavbarOnSheetProps {
  appConfig: IAppConfig;
  className?: string;
}

const NavbarOnSheet = ({ appConfig, className }: NavbarOnSheetProps) => {
  const { navbarOnSheetOpen, setNavbarOnSheetOpen, setSidebarExpand } =
    useBaseLayoutStore();

  return (
    <Dialog
      open={navbarOnSheetOpen}
      onOpenChange={() => setNavbarOnSheetOpen(!navbarOnSheetOpen)}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon8"
          className={cn(
            "mr-3.5 h-8 w-8 rounded-lg border-none bg-transparent",
            className,
          )}
          onClick={() => setSidebarExpand(true)}
        >
          <Bars3BottomLeftIcon className="h-7 w-7" />
        </Button>
      </DialogTrigger>
      <DialogContent side="left" className="w-[--sidebar-max-width]">
        <PerfectScrollbar>
          <div className="flex h-[--header-height] items-center p-4">
            <DialogClose asChild>
              <Button variant="ghost" size="icon8" className="mr-3.5">
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </DialogClose>
            <AppLogo />
          </div>
          <nav className="h-auto">
            <SidebarMenuItems
              sideNavMenuSections={appConfig.navData.sideNavMenuSections}
            />
            {appConfig.showUpgradeCard && <UpgradeCard />}
          </nav>
        </PerfectScrollbar>
      </DialogContent>
    </Dialog>
  );
};

export { NavbarOnSheet };
