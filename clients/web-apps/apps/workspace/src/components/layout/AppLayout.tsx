// import { Sidebar } from "@avplatform/layout";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { WorkspaceCrudDialogProvider } from "@/components/crud-dialog";
import { ROLE_TA } from "@/constants/roles";
import useCheckMachineStatus from "@/features/03-orchestrator/machines-table/hooks/useCheckMachineStatus";
import { useFetchPaymentStatus } from "@/features/05-tenant-admin/tenant/hooks/useFetchPaymentStatus.ee";
import { PROCESSING_STATES } from "@/features/execute-flow";
import useCheckJobTrigger from "@/features/execute-flow/hooks/useCheckJobTrigger";
import { useCurrentFlowStore } from "@/features/execute-flow/stores/current-flow-store";
import { usePreventClose } from "@/hooks/usePreventClose";
import { useRecoverCrashLogs } from "@/hooks/useRecoverCrashLogs";
import { useTauriMachineIdentity } from "@/hooks/useTauriMachineIdentity";
import useWebSocket from "@/hooks/useWebSocket";
import { ChatAssistant } from "@/react-toolkit/features/chat/ChatAssistant";
import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { useAllowedRoutesStore } from "@/stores/allowed-routes-auth-store";
import { useAppLoaderStore } from "@/stores/app-loader-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { getWebSocketUrl } from "@/utils/get-websocket-url";

import AppHeader from "./AppHeader";
import { AppLoader } from "./AppLoader";
import { AppRedirectPage } from "./AppRedirectPage";
import { PreventNavigationBlocker } from "./PreventNavigationBlocker";
import { Sidebar } from "./Sidebar";
import { getSidebarMenuBasedOnPermissions } from "./sidebar-menu-sections";

/** localStorage key used to persist the user's selected sidebar roles across sessions. */
export const SELECTED_ROLES_STORAGE_KEY = "workspace_selected_roles";

export const AppLayout = () => {
  const [connectWebsocket, setConnectWebsocket] = useState<boolean>(false);
  const [landingUrl, setLandingUrl] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();

  // Get the state and actions from the base layout store
  const { sidebarExpand, setViteEnvVars, setSidebarMenuSections, selectedRoles, setSelectedRoles } =
    useBaseLayoutStore(
      useShallow((state) => ({
        sidebarExpand: state.sidebarExpand,
        setViteEnvVars: state.setViteEnvVars,
        setSidebarMenuSections: state.setSidebarMenuSections,
        selectedRoles: state.selectedRoles,
        setSelectedRoles: state.setSelectedRoles,
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

  const { osID, username, appVersion, isLoading: isIdentityLoading } = useTauriMachineIdentity();

  // Get setExecutionState action from current flow store
  const { executionState } = useCurrentFlowStore(
    useShallow((state) => ({
      executionState: state.executionState,
      setExecutionState: state.setExecutionState,
    })),
  );

  // Only mount the navigation blocker in Tauri dev mode when an execution is
  // running. React Router only allows one active blocker at a time, so we avoid
  // registering this blocker alongside the CRUD dialog's blocker in web mode.
  const isExecuting = PROCESSING_STATES.includes(executionState);
  const showNavigationBlocker = import.meta.env.MODE !== "production" && isExecuting;

  // Prevent closing the Tauri app while an execution is in progress
  usePreventClose({
    isProcessing: PROCESSING_STATES.includes(executionState),
  });

  // Run check for pending logs if any and post them to respective job data
  useRecoverCrashLogs();

  useFetchPaymentStatus();

  // Validate user session
  const { isPending, userSession } = useValidateUserSession();

  const { isOnboardingComplete, rehydrateOnboarding } = useOnboardingStore(
    useShallow((state) => ({
      isOnboardingComplete: state.isComplete,
      rehydrateOnboarding: state.rehydrateForUser,
    })),
  );

  // Establish websocket connection and expose ref
  const { connection, isReady } = useWebSocket({
    url: getWebSocketUrl({
      osID,
      appVersion,
      username,
    }),
    shouldConnect: connectWebsocket && !isIdentityLoading,
  });

  // Check and invalidates machines data based on websocket
  useCheckMachineStatus(isReady ? connection : null);

  // Execute agent based on websocket command
  useCheckJobTrigger(isReady ? connection : null);

  // Set environment variables and initialize the selected roles on login
  useEffect(() => {
    // If the user session is still pending, do not proceed
    if (isPending || !userSession) return;

    // Set the environment variables
    setViteEnvVars({
      BASE_URL: import.meta.env.BASE_URL,
      APP_NAME: import.meta.env.VITE_APP_NAME,
      COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME,
    });

    // Initialize the selected roles from localStorage, falling back to all of the
    // user's roles on first login. Only set the store if it hasn't been initialized
    // yet for this session to avoid clobbering a user's in-session selection.
    if (selectedRoles.length === 0) {
      const storedRoles = localStorage.getItem(SELECTED_ROLES_STORAGE_KEY);
      const initialRoles =
        storedRoles && storedRoles.length > 0
          ? storedRoles.split(",")
          : (userSession?.userRoles ?? []);
      setSelectedRoles(initialRoles);
    }
  }, [isPending, selectedRoles.length, setSelectedRoles, setViteEnvVars, userSession]);

  // Recompute the sidebar menu sections and allowed routes whenever the selected
  // roles change.
  useEffect(() => {
    // If the user session is still pending or no roles are selected yet, do not proceed
    if (isPending || !userSession || selectedRoles.length === 0) return;

    const filteredSidebarMenu = getSidebarMenuBasedOnPermissions(
      selectedRoles,
      userSession?.deploymentType,
      isOnboardingComplete,
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
    isOnboardingComplete,
    isPending,
    selectedRoles,
    setAllowedRoutes,
    setSidebarMenuSections,
    setLandingUrl,
    userSession,
  ]);

  // Re-hydrate the onboarding progress for the current user once a session is available.
  useEffect(() => {
    if (isPending || !userSession) return;
    rehydrateOnboarding();
  }, [isPending, rehydrateOnboarding, userSession]);

  useEffect(() => {
    //Navigate user to first option of filteredSidebarMenu
    if (location?.pathname == "/") {
      // First-run redirect: a Tenant Admin who has not yet completed the Get
      // Started guide is sent to it before the normal landing page.
      const isTenantAdmin = userSession?.userRoles?.includes(ROLE_TA);
      if (isTenantAdmin && !isOnboardingComplete) {
        navigate("/tenant/get-started");
        return;
      }
      navigate(landingUrl);
    }
  }, [isOnboardingComplete, landingUrl, location?.pathname, navigate, userSession]);

  // Routes protection by getting allowed routes form side bar menu section
  useEffect(() => {
    if (!allowedRoutes.length) return;

    const currentPath = location.pathname;

    const hasAccess = allowedRoutes.some(
      (route) => currentPath == route || currentPath.startsWith(`${route}/`) || currentPath == "/",
    );

    if (!hasAccess) {
      // Navigate to the first available page in the left menu bar instead of
      // showing a 404 when the current page's role is no longer selected.
      navigate(landingUrl || "/page-not-found", { replace: true });
    }
  }, [allowedRoutes, landingUrl, location.pathname, navigate]);

  useEffect(() => {
    // If the user session is still pending, do not proceed
    if (isPending || !userSession) return;

    // Connect whenever the user has more than just the TD role. In a normal
    // browser session osID is empty, but the web app still needs to listen for
    // orchestrator broadcasts such as machine_status_update.
    const hasSingleTD = userSession.userRoles.includes("TD") && userSession.userRoles.length === 1;
    setConnectWebsocket(!hasSingleTD);
  }, [isPending, userSession]);

  if (isAppLoading) return <AppLoader />;

  return (
    <>
      {isPending || !userSession ? (
        <AppRedirectPage />
      ) : (
        <div className="relative min-h-screen overflow-hidden">
          <AppHeader />
          <Sidebar />
          <ScrollArea className="h-[calc(100vh-var(--header-height)-var(--header-padding))]">
            <main
              className={cn(
                "px-3 md:px-7 py-0 transition-all duration-500",
                sidebarExpand
                  ? "md:ml-[--sidebar-max-width] md:w-[calc(100vw-var(--sidebar-max-width))]"
                  : "md:ml-[--sidebar-min-width] md:w-[calc(100vw-var(--sidebar-min-width))]",
              )}
            >
              <Outlet />
            </main>
          </ScrollArea>
          {import.meta.env.MODE !== "production" && <ChatAssistant />}
        </div>
      )}
      <WorkspaceCrudDialogProvider />
      {showNavigationBlocker && (
        <PreventNavigationBlocker
          isExecuting={isExecuting}
          basePath={import.meta.env.VITE_WORKSPACE_PATH}
        />
      )}
    </>
  );
};
