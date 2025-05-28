import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { AppRedirectPage } from "./AppRedirectPage";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";

export const StudioUILayout = () => {
  // Validate user session
  const { isPending } = useValidateUserSession();

  return (
    <>
      {isPending ? (
        <AppRedirectPage />
      ) : (
        <div className="relative min-h-screen overflow-hidden">
          <AppHeader />
          <main className="h-screen w-screen overflow-hidden rounded-t-xl border pt-[calc(3.5rem+0.25rem)]">
            <Outlet />
          </main>
        </div>
      )}
    </>
  );
};
