import { Sidebar } from "@aventisia/ui/layout";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useBaseLayoutStore } from "@aventisia/ui/stores";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { DotPattern } from "@/components/layout/DotPattern";
import { IS_TAURI } from "@/constants/constants";
import useCheckMachineStatus from "@/features/orchestrator/machines-table/hooks/useCheckMachineStatus";
import {
  useCheckForUpdate,
  useRedirectOnRelaunch,
} from "@/features/tauri-updater";
import { useFetchPaymentStatus } from "@/features/tenant/hooks/useFetchPaymentStatus";
import useTauriUserMetadata from "@/hooks/useTauriUserMetadata";
import useWebSocket from "@/hooks/useWebSocket";
import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { useTuariUserMetadataStore } from "@/stores/tuari-user-metadata-store";
import { getWebSocketUrl } from "@/utils/get-websocket-url";

import AppBanner from "./AppBanner";
import AppHeader from "./AppHeader";
import { AppRedirectPage } from "./AppRedirectPage";
import { getSidebarMenuBasedOnPersmissions } from "./sidebar-menu-sections";

export const AppLayout = () => {
  const [connectWebsocket, setConnectWebsocket] = useState<boolean>(false);

  // Get the state and actions from the base layout store
  const { sidebarExpand, appBanner, setViteEnvVars, setSidebarMenuSections } =
    useBaseLayoutStore(
      useShallow((state) => ({
        sidebarExpand: state.sidebarExpand,
        appBanner: state.appBanner,
        setViteEnvVars: state.setViteEnvVars,
        setSidebarMenuSections: state.setSidebarMenuSections,
      })),
    );

  const { osID, hostname, appVersion } = useTuariUserMetadataStore(
    useShallow((state) => ({
      osID: state.osID,
      hostname: state.hostname,
      appVersion: state.appVersion,
    })),
  );

  // Redirect to relaunch URL if available (if app is inside Tauri)
  useRedirectOnRelaunch();

  // Check for new version updates if app is inside the Tauri
  useCheckForUpdate();

  useFetchPaymentStatus();

  // Validate user session
  const { isPending, userSession } = useValidateUserSession();

  useTauriUserMetadata();

  // Establish websocket connection and expose ref
  const { connection, isReady } = useWebSocket({
    url: getWebSocketUrl({
      osID,
      appVersion,
      hostname,
      userRoles: userSession?.userRoles,
    }),
    shouldConnect: connectWebsocket,
  });

  // Check and invalidates machines data based on websocket
  useCheckMachineStatus(isReady ? connection : null);

  // Set environment variables and sidebar menu sections only once
  useEffect(() => {
    // If the user session is still pending, do not proceed
    if (isPending || !userSession) return;

    // Set the environment variables
    setViteEnvVars({
      BASE_URL: import.meta.env.BASE_URL,
      APP_NAME: import.meta.env.VITE_APP_NAME,
      COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME,
    });

    // Set the sidebar menu sections
    setSidebarMenuSections(
      getSidebarMenuBasedOnPersmissions(userSession?.userRoles || []),
    );
  }, [isPending, setSidebarMenuSections, setViteEnvVars, userSession]);

  useEffect(() => {
    // If the user session is still pending, do not proceed
    if (isPending || !userSession) return;

    // Set WebSocket connection to `false` if only "TD" role is present and if its tauri app connect websocket after getting the user metadata.
    if (IS_TAURI) {
      setConnectWebsocket(userSession.userRoles[0] !== "TD" && osID != "");
    } else {
      setConnectWebsocket(userSession.userRoles[0] !== "TD");
    }
  }, [isPending, osID, userSession]);

  return (
    <>
      {isPending ? (
        <AppRedirectPage />
      ) : (
        <div className="relative min-h-screen overflow-hidden">
          <DotPattern
            className={cn(
              "z-[-10] mt-2 [mask-image:linear-gradient(to_bottom_left,white,transparent,transparent)]",
            )}
          />
          <AppBanner />
          <AppHeader />
          <Sidebar />
          <ScrollArea
            className={cn(
              appBanner
                ? "h-[calc(100vh-var(--header-height)-var(--header-padding)-var(--banner-height))]"
                : "h-[calc(100vh-var(--header-height)-var(--header-padding))]",
            )}
          >
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
