import { UnreadNotifications } from "@/react-toolkit/features/unread-notifications/components/unread-notifications";
import { UserAccountModal } from "@/react-toolkit/features/user-account/UserAccountModal";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { NavbarOnSheet } from "@/react-toolkit/layout/NavbarOnSheet";
import { Sidebar } from "@/react-toolkit/layout/sidebar";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { IAppConfig } from "@/react-toolkit/types/app-config";

import { SearchBox } from "@aventisia/ui";
import { cn } from "@aventisia/ui/lib";

interface HeaderProps {
  appConfig: IAppConfig;
  extraContentLeft?: React.ReactNode;
  extraContentRight?: React.ReactNode;
  className?: string;
  isDesktop?: boolean;
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
  isDesktop,
}: HeaderProps) => {
  const { userSession } = useUserSessionStore();
  return (
    <header
      className={cn(
        "sticky top-0 z-10 w-full bg-white p-[var(--header-padding)] pb-0 backdrop-blur-md",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-[var(--header-height)] items-center rounded-xl bg-gradient-to-r from-[#12102d] via-[#2c276c] to-[#12102d] p-5 shadow xs:pl-4 xs:pr-3",
        )}
      >
        <div className="flex flex-grow items-center">
          {!isDesktop && (
            <>
              <Sidebar
                className={cn(["hidden md:block"])}
                appConfig={appConfig}
              />
              <NavbarOnSheet className="flex md:hidden" appConfig={appConfig} />
            </>
          )}
          <AppLogo />
          {/* Extra content to render on left side */}
          {extraContentLeft}
        </div>
        {appConfig.searchBoxOptions.show ? <SearchBox /> : null}
        <div className="ml-4 flex items-center gap-4">
          {/* Extra icons or content to render on along side of notificataions and UAM */}
          {extraContentRight}
          {userSession ? (
            <>
              <UnreadNotifications />
              <UserAccountModal isDesktop={isDesktop} />
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export { Header };
