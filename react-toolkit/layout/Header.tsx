import { UnreadNotifications } from "@/react-toolkit/features/unread-notifications/components/unread-notifications";
import { UserAccountModal } from "@/react-toolkit/features/user-account/UserAccountModal";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { Navbar } from "@/react-toolkit/layout/navbar";
import { NavbarOnSheet } from "@/react-toolkit/layout/NavbarOnSheet";
import { Sidebar } from "@/react-toolkit/layout/sidebar";
import { SidebarToggle } from "@/react-toolkit/layout/SidebarToggle";
import { cn } from "@/react-toolkit/lib/utils";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { IAppConfig } from "@/react-toolkit/types/app-config";
import { NavLocation } from "@/react-toolkit/types/nav-data-types";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { SearchBox } from "@/react-toolkit/ui/custom/SearchBox";

interface HeaderProps {
  appConfig: IAppConfig;
  extraContentLeft?: React.ReactNode;
  extraContentRight?: React.ReactNode;
  className?: string;
}

/**
 * App' header. Since it is a shared component so we'll have to accept app config as prop even if it is constant inside a ts file and we can access directly
 * @param {IAppConfig} appConfig app' config. Do not try to import constant appConfig directly
 * @param {string} [className] optional to override or add tailwind classes
 */
const Header = ({
  appConfig,
  extraContentLeft,
  extraContentRight,
  className,
}: HeaderProps) => {
  const { userSession } = useUserSessionStore();
  return (
    <header
      className={cn(
        "sticky top-0 z-10 w-full border-b bg-white/95 backdrop-blur-md",
        className,
        appConfig.navData.navLocation === NavLocation.header
          ? "flex justify-center"
          : "px-5 xs:px-4",
      )}
    >
      <div
        className={cn(
          "flex h-[var(--header-height)] items-center py-5 xs:py-4",
          appConfig.navData.navLocation === NavLocation.header
            ? "w-full"
            : null,
          appConfig.appMaxWidth ? appConfig.appMaxWidth : null,
        )}
      >
        <div className="flex flex-grow items-center">
          {appConfig.navData.navLocation === NavLocation.sidebar ? (
            <>
              <SidebarToggle className="hidden md:flex" />
              <Sidebar
                className={cn(["hidden md:block"])}
                appConfig={appConfig}
              />
            </>
          ) : null}
          <NavbarOnSheet className="flex md:hidden" appConfig={appConfig} />
          <AppLogo />
          {appConfig.navData.navLocation === NavLocation.header ? (
            <Navbar navData={appConfig.navData} />
          ) : null}
          {/* Extra content to render on left side */}
          {extraContentLeft}
        </div>
        {appConfig.searchBoxOptions.show ? (
          <SearchBox
            kbdShortCutClassName={
              appConfig.searchBoxOptions.position === "right"
                ? "right-1.5"
                : "right-2.5"
            }
            className={`ml-4 flex items-center ${
              appConfig.searchBoxOptions.position === "right"
                ? "hidden h-[2.11rem] lg:flex"
                : "hidden md:absolute md:left-1/2 md:flex md:h-[2.5rem] md:w-[22rem] md:-translate-x-1/2 lg:w-[33rem]"
            }`}
          />
        ) : null}
        <div className="ml-4 flex items-center gap-4">
          {/* Extra icons or content to render on along side of notificataions and UAM */}
          {extraContentRight}
          {userSession ? (
            <>
              <UnreadNotifications />
              <UserAccountModal />
            </>
          ) : (
            <>
              <a
                href={import.meta.env.VITE_LOGIN_URL}
                className={cn(buttonVariants({ variant: "outline" }), "h-8")}
              >
                Login
              </a>
              <a
                href={import.meta.env.VITE_SIGN_UP_URL}
                className={cn(buttonVariants({ variant: "default" }), "h-8")}
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export { Header };
