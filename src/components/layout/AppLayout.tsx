import { getActionSelectorData } from "@/apis/get-action-selector-data";
import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";
import {
  useCheckForUpdate,
  useRedirectOnRelaunch,
} from "@/features/tauri-updater";
import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { cn } from "@aventisia/ui/lib";
import { useBaseLayoutStore } from "@aventisia/ui/stores";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import AppBanner from "./AppBanner";
import AppHeader from "./AppHeader";
import { AppRedirectPage } from "./AppRedirectPage";
// import { useGetBlockActions } from "@/features/react-flow/hooks/useGetBlockActions";

export const AppLayout = () => {
  const [loading, setLoading] = useState(true);

  // Get the appBanner state from the base layout store
  const { appBanner } = useBaseLayoutStore(
    useShallow((state) => ({
      appBanner: state.appBanner,
    })),
  );

  // Redirect to relaunch URL if available (if app is inside Tauri)
  useRedirectOnRelaunch();

  // Check for new version updates if app is inside the Tauri
  useCheckForUpdate();

  // Validate user session
  const { isPending } = useValidateUserSession();

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
      setActionSelectorData(data);
    });
    setLoading(false);
  }, [setActionSelectorData]);

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
