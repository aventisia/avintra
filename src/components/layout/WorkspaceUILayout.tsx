// import { ChatAssistant } from "@/react-toolkit/features/chat/ChatAssistant";
import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { Header } from "@/react-toolkit/layout/Header";
import { cn } from "@/react-toolkit/lib/utils";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { workspaceAppConfig } from "@/workspace-app-config";
import { Outlet } from "react-router-dom";

export const WorkspaceUILayout = () => {
  const { sidebarExpand } = useBaseLayoutStore();

  // Validate user session
  const { isPending } = useValidateUserSession();

  return (
    <>
      {isPending ? (
        <RedirectPage />
      ) : (
        <div className={cn("bg-gradient-to-b from-slate-100 to-slate-50")}>
          <div
            className={cn(
              "relative min-h-screen overflow-hidden",
              "bg-[radial-gradient(rgb(0_0_0_/_10%)_1px,_transparent_0)] bg-[length:25px_25px]",
            )}
          >
            <Header appConfig={workspaceAppConfig} className="bg-white" />
            <ScrollArea className="h-[calc(100vh-var(--header-height)-1px)]">
              <main
                className={cn(
                  "m-2 px-7 py-0 transition-[margin] duration-300",
                  sidebarExpand
                    ? "md:ml-[--sidebar-max-width]"
                    : "md:ml-[--sidebar-min-width]",
                )}
              >
                <Outlet />
              </main>
            </ScrollArea>
            {/* <ChatAssistant /> */}
          </div>
        </div>
      )}
    </>
  );
};
