import { cn } from "@avplatform/ui/lib";
import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { PROCESSING_STATES } from "@/features/execute-flow";
import { usePreventClose } from "@/hooks/usePreventClose";
import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { useAppLoaderStore } from "@/stores/app-loader-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import AppHeader from "./AppHeader";
import { AppLoader } from "./AppLoader";
import { AppRedirectPage } from "./AppRedirectPage";

export const AppLayout = () => {
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
          <AppHeader />
          <main
            className={cn(
              "w-full overflow-hidden h-[calc(100vh-var(--header-height)-var(--header-padding))]",
            )}
          >
            <Outlet />
          </main>
        </div>
      )}
    </>
  );
};
