import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { Header } from "@/react-toolkit/layout/Header";
import { cn } from "@/react-toolkit/lib/utils";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { workspaceAppConfig } from "@/workspace-app-config";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";

export const WorkspaceUILayout = () => {
  const { sidebarExpand } = useBaseLayoutStore();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const isOnAgentsPage = location.pathname === "/agents";
  const isDesktop = isOnAgentsPage && searchParams.get("isDesktop") === "true";

  // Validate user session
  const { isPending } = useValidateUserSession();

  return (
    <>
      {isPending ? (
        <RedirectPage />
      ) : (
        <div className="relative min-h-screen overflow-hidden">
          <Header isDesktop={isDesktop} appConfig={workspaceAppConfig} />
          <ScrollArea className="h-[calc(100vh-var(--header-height)-var(--header-padding)))]">
            <main
              className={cn(
                "px-7 py-0 transition-[margin] duration-500",
                !isDesktop &&
                  (sidebarExpand
                    ? "md:ml-[--sidebar-max-width]"
                    : "md:ml-[--sidebar-min-width]"),
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
