import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";

const AccountsUILayout = () => {
  // Get the state and actions from the base layout store
  const { setViteEnvVars } = useBaseLayoutStore(
    useShallow((state) => ({
      setViteEnvVars: state.setViteEnvVars,
    })),
  );

  // Set environment variables only once
  useEffect(() => {
    // Set the environment variables
    setViteEnvVars({
      BASE_URL: import.meta.env.BASE_URL,
      APP_NAME: import.meta.env.VITE_APP_NAME,
      COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback={<RedirectPage />}>
      <Outlet />
    </Suspense>
  );
};

export { AccountsUILayout };
