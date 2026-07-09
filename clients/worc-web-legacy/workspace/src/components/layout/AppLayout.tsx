import { Sidebar } from "@aventisia/ui/layout";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useBaseLayoutStore } from "@aventisia/ui/stores";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { DotPattern } from "@/components/layout/DotPattern";
import { IS_TAURI } from "@/constants/constants";
import useCheckMachineStatus from "@/features/03-orchestrator/machines-table/hooks/useCheckMachineStatus";
// import {
//   useCheckForUpdate,
//   useRedirectOnRelaunch,
// } from "@/features/tauri-updater";
import { useFetchPaymentStatus } from "@/features/05-tenant-admin/tenant/hooks/useFetchPaymentStatus";
import { PROCESSING_STATES } from "@/features/execute-flow";
import useCheckJobTrigger from "@/features/execute-flow/hooks/useCheckJobTrigger";
import { useCurrentFlowStore } from "@/features/execute-flow/stores/current-flow-store";
import { AppUpdateToast } from "@/features/tauri-updater/components/AppUpdateToast";
import { usePreventClose } from "@/hooks/usePreventClose";
import { usePreventNavigation } from "@/hooks/usePreventNavigation";
import { useRecoverCrashLogs } from "@/hooks/useRecoverCrashLogs";
import useTauriUserMetadata from "@/hooks/useTauriUserMetadata";
import useWebSocket from "@/hooks/useWebSocket";
import { ChatAssistant } from "@/react-toolkit/features/chat/ChatAssistant";
import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { useAllowedRoutesStore } from "@/stores/allowed-routes-auth-store";
import { useAppLoaderStore } from "@/stores/app-loader-store";
import { useTuariUserMetadataStore } from "@/stores/tuari-user-metadata-store";
import { getWebSocketUrl } from "@/utils/get-websocket-url";

import AppBanner from "./AppBanner";
import AppHeader from "./AppHeader";
import { AppLoader } from "./AppLoader";
import { AppRedirectPage } from "./AppRedirectPage";
import { getSidebarMenuBasedOnPermissions } from "./sidebar-menu-sections";

export const AppLayout = () => {
  const [connectWebsocket, setConnectWebsocket] = useState<boolean>(false);
  const [landingUrl, setLandingUrl] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();

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
  const { isLoading: isAppLoading } = useAppLoaderStore(
    useShallow((state) => ({ isLoading: state.isLoading })),
  );
  const { allowedRoutes, setAllowedRoutes } = useAllowedRoutesStore(
    useShallow((state) => ({
      allowedRoutes: state.allowedRoutes,
      setAllowedRoutes: state.setAllowedRoutes,
    })),
  );

  const { osID, hostname, appVersion } = useTuariUserMetadataStore(
    useShallow((state) => ({
      osID: state.osID,
      hostname: state.hostname,
      appVersion: state.appVersion,
    })),
  );

  // Get setExecutionState action from current flow store
  const { executionState } = useCurrentFlowStore(
    useShallow((state) => ({
      executionState: state.executionState,
      setExecutionState: state.setExecutionState,
    })),
  );

  usePreventNavigation({
    enabled: import.meta.env.MODE !== "production",

    basePath: import.meta.env.VITE_WORKSPACE_PATH,
    isDirty: false,

    isExecuting: PROCESSING_STATES.includes(executionState),
  });

  // Prevent closing the Tauri app while an execution is in progress
  usePreventClose({
    isProcessing: PROCESSING_STATES.includes(executionState),
  });

  // Run check for pending logs if any and post them to respective job data
  useRecoverCrashLogs();

  // Redirect to relaunch URL if available (if app is inside Tauri)
  // useRedirectOnRelaunch();

  // Check for new version updates if app is inside the Tauri
  // useCheckForUpdate();

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
    }),
    shouldConnect: connectWebsocket,
  });

  // Check and invalidates machines data based on websocket
  useCheckMachineStatus(isReady ? connection : null);

  // Execute agent based on websocket command
  useCheckJobTrigger(isReady ? connection : null);

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

    const filteredSidebarMenu = getSidebarMenuBasedOnPermissions(
      userSession?.userRoles || [],
      userSession?.deploymentType,
    );
    // Set the sidebar menu sections
    setSidebarMenuSections(filteredSidebarMenu);

    //Get allowed routes
    const allowedRoutes = filteredSidebarMenu.flatMap((section) =>
      section.menuItems.flatMap((item) => [
        item.route,
        ...(item.subMenuItems?.map((sub) => sub.route) ?? []),
      ]),
    );

    setAllowedRoutes([...allowedRoutes, "/account"]);

    setLandingUrl(filteredSidebarMenu[0]?.menuItems[0]?.route);
  }, [
    isPending,
    setAllowedRoutes,
    setSidebarMenuSections,
    setViteEnvVars,
    userSession,
  ]);

  useEffect(() => {
    //Navigate user to first option of filteredSidebarMenu
    if (location?.pathname == "/") {
      navigate(landingUrl);
    }
  }, [landingUrl, location?.pathname, navigate]);

  // Routes protection by getting allowed routes form side bar menu section
  useEffect(() => {
    if (!allowedRoutes.length) return;

    const currentPath = location.pathname;

    const hasAccess = allowedRoutes.some(
      (route) =>
        currentPath == route ||
        currentPath.startsWith(`${route}/`) ||
        currentPath == "/",
    );

    if (!hasAccess) {
      navigate("/page-not-found", { replace: true });
    }
  }, [allowedRoutes, location.pathname, navigate]);

  useEffect(() => {
    // If the user session is still pending, do not proceed
    if (isPending || !userSession) return;

    // Check if the user has exactly one "TD" role
    const hasSingleTD =
      userSession.userRoles.includes("TD") &&
      userSession.userRoles.length === 1;
    if (IS_TAURI) {
      setConnectWebsocket(!hasSingleTD && osID != "");
    } else {
      setConnectWebsocket(!hasSingleTD);
    }

    //If TU role user login through web display message to use Desktop app
    const hasSingleTU =
      userSession.userRoles.includes("TU") &&
      userSession.userRoles.length === 1;

    if (!IS_TAURI && hasSingleTU) {
      navigate("/assist");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, osID, userSession]);

  if (isAppLoading) return <AppLoader />;

  return (
    <>
      {isPending || !userSession ? (
        <AppRedirectPage />
      ) : (
        <div className="relative min-h-screen overflow-hidden">
          <DotPattern
            className={cn(
              "z-[-10] mt-2 [mask-image:linear-gradient(to_bottom_left,white,transparent,transparent)]",
            )}
          />
          <AppBanner />
          {IS_TAURI ? <AppUpdateToast domain={window.location.origin} /> : null}
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
                "px-3 md:px-7 py-0 transition-[margin] duration-500",
                sidebarExpand
                  ? "md:ml-[--sidebar-max-width]"
                  : "md:ml-[--sidebar-min-width]",
              )}
            >
              <Outlet />
            </main>
          </ScrollArea>
          {import.meta.env.MODE !== "production" && <ChatAssistant />}
        </div>
      )}
    </>
  );
};
