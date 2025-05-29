import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { cn } from "@aventisia/ui/lib";
import { AppRedirectPage } from "./AppRedirectPage";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useState } from "react";
import { getActionSelectorData } from "@/apis/get-action-selector-data";

export const AppLayout = () => {
  const [loading, setLoading] = useState(true);

  // Validate user session
  const { isPending } = useValidateUserSession();

  // Get setActionSelectorData function from the store
  const { setActionSelectorData } = useNodeSelectorStore(
    useShallow((state) => ({
      setActionSelectorData: state.setActionSelectorData,
    })),
  );

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
          <AppHeader />
          <main
            className={cn(
              "h-[calc(100vh-var(--header-height)-var(--header-padding))] w-full overflow-hidden",
            )}
          >
            <Outlet />
          </main>
        </div>
      )}
    </>
  );
};
