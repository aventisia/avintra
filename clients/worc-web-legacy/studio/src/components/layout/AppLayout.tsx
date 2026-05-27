import { getActionSelectorData } from "@/apis/get-action-selector-data";
import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";
import { canWeRenderNodeOrCategory } from "@/features/action-selector/utils/action-visibilty";
import { usePreventClose } from "@/hooks/usePreventClose";
import useTauriUserMetadata from "@/hooks/useTauriUserMetadata";
// import {
//   useCheckForUpdate,
//   useRedirectOnRelaunch,
// } from "@/features/tauri-updater";
import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { useAppLoaderStore } from "@/stores/app-loader-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { cn } from "@aventisia/ui/lib";
import { useBaseLayoutStore } from "@aventisia/ui/stores";
import { DeploymentType } from "@aventisia/ui/types";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import AppBanner from "./AppBanner";
import AppHeader from "./AppHeader";
import { AppLoader } from "./AppLoader";
import { AppRedirectPage } from "./AppRedirectPage";

export const AppLayout = () => {
  const [loading, setLoading] = useState(true);

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
    isProcessing: executionState === "executing" || executionState === "paused",
  });

  useTauriUserMetadata();

  // Redirect to relaunch URL if available (if app is inside Tauri)
  // useRedirectOnRelaunch();

  // Check for new version updates if app is inside the Tauri
  // useCheckForUpdate();

  // Validate user session
  const { isPending, userSession } = useValidateUserSession();

  // Get setActionSelectorData function from the store
  const { setActionSelectorData } = useNodeSelectorStore(
    useShallow((state) => ({
      setActionSelectorData: state.setActionSelectorData,
    })),
  );

  //Get block category actions
  // useGetBlockActions();

  // Set action selector data on mount
  useEffect(() => {
    getActionSelectorData().then((data) => {
      // deploymentType (Commercial / Enterprise)
      const deploymentType = userSession?.deploymentType as DeploymentType;

      const filtered = data.map((primary) => ({
        ...primary,

        // Filter Action Categories based on visibility
        actionCategories: primary.actionCategories
          .filter((actionCategory) =>
            canWeRenderNodeOrCategory(
              actionCategory.doNotRenderIf,
              deploymentType,
            ),
          )

          // For visible categories, also filter individual actions
          .map((actionCategory) => ({
            ...actionCategory,

            actions: actionCategory.actions?.filter((action) =>
              canWeRenderNodeOrCategory(action.doNotRenderIf, deploymentType),
            ),
          }))

          // Remove categories that end up with no actions
          .filter((ac) => ac.actions?.length),
      }));

      setActionSelectorData(filtered);
    });

    setLoading(false);
  }, [setActionSelectorData, userSession?.deploymentType]);

  if (isAppLoading) return <AppLoader />;

  return (
    <>
      {isPending || loading ? (
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
