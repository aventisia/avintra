import { Sidebar } from "@avplatform/layout/sidebar";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { GlobalAdminCrudDialogProvider } from "@/components/crud-dialog/GlobalAdminCrudDialogProvider";
import { useGlobalAdminSession } from "@/hooks/useGlobalAdminSession.hook";

import { AppHeader } from "./AppHeader";
import { globalAdminSidebarSections } from "./global-admin-sidebar-sections";

export function GlobalAdminLayout() {
  const access = useGlobalAdminSession();
  const { sidebarExpand, setSidebarMenuSections } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
      setSidebarMenuSections: state.setSidebarMenuSections,
    })),
  );

  useEffect(() => {
    setSidebarMenuSections(globalAdminSidebarSections);
  }, [setSidebarMenuSections]);

  if (access !== "granted") return null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AppHeader />
      <Sidebar />
      <ScrollArea className="h-[calc(100vh-var(--header-height)-var(--header-padding))]">
        <main
          className={cn(
            "px-3 py-4 transition-all duration-500 md:px-7",
            sidebarExpand
              ? "md:ml-[--sidebar-max-width] md:w-[calc(100vw-var(--sidebar-max-width))]"
              : "md:ml-[--sidebar-min-width] md:w-[calc(100vw-var(--sidebar-min-width))]",
          )}
        >
          <Outlet />
        </main>
      </ScrollArea>
      <GlobalAdminCrudDialogProvider />
    </div>
  );
}
