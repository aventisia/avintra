import { Outlet } from "react-router-dom";
import { workspaceAppConfig } from "@/workspace-app-config";
import { useBaseLayoutStore } from "@/react-toolkit/stores";
import { cn } from "@/react-toolkit/lib";
import { RedirectPage } from "@/react-toolkit/pages";
import { Header } from "@/react-toolkit/components/layout";
import { ChatAssistant } from "@/react-toolkit/features";
import { ScrollArea } from "@/react-toolkit/components/ui";
import { useValidateUserSession } from "@/react-toolkit/hooks";

export const WorkspaceUILayout = () => {
  const { sidebarExpand } = useBaseLayoutStore();

  // Validate user session
  const { isPending } = useValidateUserSession();

  return (
    <>
      {isPending ? (
        <RedirectPage />
      ) : (
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
      )}
    </>
  );
};
