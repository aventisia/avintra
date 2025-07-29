import { AppLogo } from "@/react-toolkit/layout/AppLogo";

import { cn } from "@aventisia/ui/lib";
import React from "react";

interface HeaderProps {
  extraContentLeft?: React.ReactNode;
  extraContentRight?: React.ReactNode;
  extraContentCenter?: React.ReactNode;
  className?: string;
}

/**
 * App' header. Since it is a shared component so we'll have to accept app config as prop even if it is constant inside a ts file and we can access directly
 * @param {IAppConfig} appConfig app' config. Do not try to import constant appConfig directly
 * @param {string} [className] optional to override or add tailwind classes
 */
const Header = ({
  extraContentLeft,
  extraContentRight,
  extraContentCenter,
  className,
}: HeaderProps) => {
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
          <AppLogo />
          {/* Extra content to render on left side */}
          {extraContentLeft}
        </div>

        {/* Extra content center */}
        <div className="items-center rounded-xl transition-all duration-300 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
          {extraContentCenter}
        </div>
        <div className="ml-4 flex items-center gap-4">
          {/* Extra icons or content to render on along side of notificataions and UAM */}
          {extraContentRight}
          {/* {userSession ? (
            <>
              <UserAccountModal />
            </>
          ) : null} */}
        </div>
      </div>
    </header>
  );
};

export { Header };
