import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { cn } from "@aventisia/ui/lib";
import { AppRedirectPage } from "./AppRedirectPage";
import { Outlet } from "react-router-dom";

export const StudioUILayout = () => {
  // Validate user session
  const { isPending } = useValidateUserSession();

  return (
    <>
      {isPending ? (
        <AppRedirectPage />
      ) : (
        <main
          className={cn(
            "h-screen w-screen overflow-hidden rounded-t-xl border",
          )}
        >
          <Outlet />
        </main>
      )}
    </>
  );
};
