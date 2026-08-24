import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { useAppLoaderStore } from "@/stores/app-loader-store";

import AppHeader from "./AppHeader";
import { AppLoader } from "./AppLoader";
import { AppRedirectPage } from "./AppRedirectPage";
import { Sidebar } from "./Sidebar";

export const AppLayout = () => {
  const { isLoading: isAppLoading } = useAppLoaderStore(
    useShallow((state) => ({ isLoading: state.isLoading })),
  );

  const { sidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({ sidebarExpand: state.sidebarExpand })),
  );

  // Validate user session. Every route in Atlas is protected, so we block
  // rendering until the session has been validated/refreshed.
  const { isPending } = useValidateUserSession();

  if (isAppLoading) return <AppLoader />;

  return (
    <>
      {isPending ? (
        <AppRedirectPage />
      ) : (
        <div className="relative min-h-screen overflow-hidden">
          <AppHeader />
          <Sidebar />
          <ScrollArea className="h-[calc(100vh-var(--header-height)-var(--header-padding))]">
            <main
              className={cn(
                "px-3 py-0 transition-all duration-500 md:px-7",
                sidebarExpand
                  ? "md:ml-[--sidebar-max-width] md:w-[calc(100vw-var(--sidebar-max-width))]"
                  : "md:ml-[--sidebar-min-width] md:w-[calc(100vw-var(--sidebar-min-width))]",
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
