import { LLMSelector } from "@/components/layout/LLMSelector";
import { UnreadNotifications } from "@/react-toolkit/features/unread-notifications/components/unread-notifications";
import { UserAccountModal } from "@/react-toolkit/features/user-account/UserAccountModal";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { DotSeparator } from "@/react-toolkit/ui/custom/DotSeparator";
import { useLocation } from "react-router-dom";
import { NavigationTabs } from "./NavigationTabs";

const MLModelBuilderHeader = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelName = queryParams.get("mn") || "";

  return (
    <div className="m-2 flex justify-between rounded-lg bg-white p-1">
      <div className="flex h-10 items-center rounded-lg pl-2">
        <AppLogo className="h-6 text-lg font-bold" />
        <DotSeparator className="ml-[0.9rem] mr-[0.6rem]" />
        <span className="mr-[0.6rem] truncate text-sm font-medium">
          {modelName}
        </span>
        <LLMSelector />
      </div>
      <div className="flex h-10 items-center gap-2 rounded-lg px-1.5">
        <NavigationTabs />
        <UnreadNotifications className="mt-0 mlg:mt-1.5" triggerSize="icon8" />
        <UserAccountModal sizeClassName="h-8 w-8" />
      </div>
    </div>
  );
};

export { MLModelBuilderHeader };
