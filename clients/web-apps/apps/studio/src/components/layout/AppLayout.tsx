import { cn } from "@avplatform/ui/lib";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { PROCESSING_STATES } from "@/features/execute-flow";
import { usePreventClose } from "@/hooks/usePreventClose";
import useTauriUserMetadata from "@/hooks/useTauriUserMetadata";
// import {
//   useCheckForUpdate,
//   useRedirectOnRelaunch,
// } from "@/features/tauri-updater";
import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { useAppLoaderStore } from "@/stores/app-loader-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import AppBanner from "./AppBanner";
import AppHeader from "./AppHeader";
import { AppLoader } from "./AppLoader";
import { AppRedirectPage } from "./AppRedirectPage";

export const AppLayout = () => {
  // Get the appBanner state from the base layout store
  const { appBanner } = useBaseLayoutStore(
    useShallow((state) => ({
      appBanner: state.appBanner,
    })),
  );

  const { isLoading: isAppLoading } = useAppLoaderStore(
    useShallow((state) => ({ isLoading: state.isLoading })),
  );

  // Get setExecutionState action from current flow store
  const { executionState } = useCurrentFlowStore(
    useShallow((state) => ({
      executionState: state.executionState,
    })),
  );

  // Prevent closing the Tauri app while an execution is in progress
  usePreventClose({
    isProcessing: PROCESSING_STATES.includes(executionState),
  });

  useTauriUserMetadata();

  // Redirect to relaunch URL if available (if app is inside Tauri)
  // useRedirectOnRelaunch();

  // Check for new version updates if app is inside the Tauri
  // useCheckForUpdate();

  // Validate user session
  const { isPending } = useValidateUserSession();

  //Get block category actions
  // useGetBlockActions();

  if (isAppLoading) return <AppLoader />;

  return (
    <>
      {isPending ? (
        <AppRedirectPage />
      ) : (
        <div className="relative flex min-h-screen flex-col items-center">
          <AppBanner />
          <AppHeader />
          <main
            className={cn(
              "w-full overflow-hidden",
              appBanner
                ? "h-[calc(100vh-var(--header-height)-var(--header-padding)-var(--banner-height))]"
                : "h-[calc(100vh-var(--header-height)-var(--header-padding))]",
            )}
          >
            <Outlet />
          </main>
        </div>
      )}
    </>
  );
};
