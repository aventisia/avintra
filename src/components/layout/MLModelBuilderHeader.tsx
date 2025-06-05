import { LLMSelector } from "@/components/layout/LLMSelector";
import { UnreadNotifications } from "@/react-toolkit/features/unread-notifications/components/unread-notifications";
import { UserAccountModal } from "@/react-toolkit/features/user-account/UserAccountModal";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";

import { DotSeparator } from "@aventisia/ui";
import { useLocation } from "react-router-dom";

import { NavigationTabs } from "./NavigationTabs";

const MLModelBuilderHeader = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelName = queryParams.get("mn") || "";

  return (
    <header className="sticky top-0 z-10 w-full bg-white p-[var(--header-padding)] pb-0 backdrop-blur-md">
      <div className="flex h-[var(--header-height)] items-center rounded-xl bg-gradient-to-r from-[#12102d] via-[#2c276c] to-[#12102d] p-5 shadow xs:pl-4 xs:pr-3">
        <div className="flex flex-grow items-center">
          <AppLogo />
          <DotSeparator className="text-[2rem]" />
          <span className="mr-[0.6rem] truncate text-sm font-medium text-white">
            {modelName}
          </span>
        </div>
        <div className="items-center rounded-xl transition-all duration-300 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
          <LLMSelector />
        </div>
        <div className="flex items-center gap-4">
          <NavigationTabs />
          <UnreadNotifications />
          <UserAccountModal sizeClassName="h-8 w-8" />
        </div>
      </div>
    </header>
  );
};

export { MLModelBuilderHeader };
