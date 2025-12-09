import { AvailableCredits } from "@/features/available-credits/AvailableCredits";
import { FlowParticipantsFacePile } from "@/features/share-access/components/share-avatars/FlowParticipantsFacePile";
import { useAutoLogout } from "@/hooks/useAutoLogout";
import { useClearQueryParamsOutsideView } from "@/hooks/useClearQueryParamsOutsideView";
import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { Header } from "@/react-toolkit/layout/Header";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";

import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Outlet } from "react-router-dom";

// import { LLMSelector } from "./LLMSelector";
import ModelInfo from "./ModelInfo";
// import { SetupTestTabs } from "./SetupTestTabs";
import HeaderMenuActions from "./header-menu-actions";

export const MLModelBuilderLayout = () => {
  useClearQueryParamsOutsideView();
  // Validate user session
  const { isPending } = useValidateUserSession();

  useAutoLogout();

  return (
    <>
      {isPending ? (
        <RedirectPage />
      ) : (
        <div className="relative min-h-screen overflow-hidden bg-slate-100">
          <Header
            extraContentRight={
              <>
                <FlowParticipantsFacePile />
                <AvailableCredits />
                <HeaderMenuActions />
              </>
            }
            // extraContentCenter={<SetupTestTabs />}
            extraContentLeft={<ModelInfo />}
          />
          <ScrollArea className="mt-2.5 h-[calc(100vh-4.5rem)]">
            <main
              className={cn(
                "h-[calc(100vh-4.5rem)] p-2 py-0 transition-[margin] duration-500",
              )}
            >
              <Outlet />
            </main>
          </ScrollArea>
        </div>
      )}
    </>
  );
};
