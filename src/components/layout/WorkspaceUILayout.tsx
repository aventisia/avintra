import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { Header } from "@/react-toolkit/layout/Header";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { useTauriStore } from "@/stores/tauri-store";
import { workspaceAppConfig } from "@/workspace-app-config";

import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

export const WorkspaceUILayout = () => {
  // Get the state of the sidebar from the store
  const { sidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
    })),
  );

  // Get the state if app is open in tauri window
  const { isTauri } = useTauriStore(
    useShallow((state) => ({
      isTauri: state.isTauri,
    })),
  );

  // Validate user session
  const { isPending } = useValidateUserSession();

  return (
    <>
      {isPending ? (
        <RedirectPage />
      ) : (
        <div className="relative min-h-screen overflow-hidden">
          <Header appConfig={workspaceAppConfig} />
          <ScrollArea className="h-[calc(100vh-var(--header-height)-var(--header-padding)))]">
            <main
              className={cn(
                "px-7 py-0 transition-[margin] duration-500",
                !isTauri &&
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
