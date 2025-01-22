import { ChatAssistant } from "@/react-toolkit/features/chat/ChatAssistant";
//import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { Header } from "@/react-toolkit/layout/Header";
import { cn } from "@/react-toolkit/lib/utils";
//import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { workspaceAppConfig } from "@/workspace-app-config";
import { Outlet } from "react-router-dom";

export const WorkspaceUILayout = () => {
  const { sidebarExpand } = useBaseLayoutStore();

  // Validate user session
  //const { isPending } = useValidateUserSession();

  return (
    <>
      {/* {isPending ? (
        <RedirectPage />
      ) : ( */}
        <div className="relative min-h-screen overflow-hidden">
          <Header appConfig={workspaceAppConfig} />
          <ScrollArea className="h-[calc(100vh-var(--header-height)-1px)]">
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
          <ChatAssistant />
        </div>
      {/* )} */}
    </>
  );
};
