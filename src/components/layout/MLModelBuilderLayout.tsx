import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { Header } from "@/react-toolkit/layout/Header";
import { cn } from "@aventisia/ui/lib";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Outlet } from "react-router-dom";
import { NavigationTabs } from "./NavigationTabs";
import { LLMSelector } from "./LLMSelector";
import ModelInfo from "./ModelInfo";

export const MLModelBuilderLayout = () => {
  // Validate user session
  const { isPending } = useValidateUserSession();

  return (
    <>
      {isPending ? (
        <RedirectPage />
      ) : (
        <div className="relative min-h-screen overflow-hidden bg-slate-100">
          <Header
            extraContentRight={<NavigationTabs />}
            extraContentCenter={<LLMSelector />}
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
