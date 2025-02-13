import { Header } from "@/react-toolkit/layout/Header";
import { cn } from "@/react-toolkit/lib/utils";
import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { mlModelBuilderAppConfig } from "@/mi-model-builder-app-config";
import { Outlet } from "react-router-dom";
import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";

export const MLModelBuilderLayout = () => {
  const { sidebarExpand } = useBaseLayoutStore();

  // Validate user session
  const { isPending } = useValidateUserSession();

  return (
    <>
      {isPending ? (
        <RedirectPage />
      ) : (
        <div className="relative min-h-screen overflow-hidden">
          <Header appConfig={mlModelBuilderAppConfig} />
          <ScrollArea className="h-[calc(100vh-var(--header-height)-1px)] bg-slate-50">
            {/* added bg for main*/}
            <main
              className={cn(
                "px-7 py-0 transition-[margin] duration-500",
                sidebarExpand
                  ? "md:ml-[--sidebar-max-width]"
                  : "md:ml-[--sidebar-min-width]",
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
