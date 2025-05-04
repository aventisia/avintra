import { Sidebar } from "@aventisia/ui/layout";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useBaseLayoutStore } from "@aventisia/ui/stores";
import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { useTauriStore } from "@/stores/tauri-store";

import AppHeader from "./AppHeader";
import { AppRedirectPage } from "./AppRedirectPage";
import { sidebarMenuSections } from "./sidebar-menu-sections";

export const AppLayout = () => {
  // Get the state of the sidebar from the store
  const { sidebarExpand, setSidebarMenuSections } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
      setSidebarMenuSections: state.setSidebarMenuSections,
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

  // Set the sidebar menu sections
  setSidebarMenuSections(sidebarMenuSections);

  return (
    <>
      {isPending ? (
        <AppRedirectPage />
      ) : (
        <div className="relative min-h-screen overflow-hidden">
          <AppHeader />
          <Sidebar />
          <ScrollArea className="h-[calc(100vh-var(--header-height)-var(--header-padding)))]">
            <main
              className={cn(
                "px-7 py-0 transition-[margin] duration-500",
                !isTauri && sidebarExpand
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
