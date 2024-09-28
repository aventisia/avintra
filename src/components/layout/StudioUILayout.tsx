import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { cn } from "@/react-toolkit/lib/utils";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { Outlet } from "react-router-dom";

export const StudioUILayout = () => {
  // Validate user session
  const { isPending } = useValidateUserSession();

  return (
    <>
      {isPending ? (
        <RedirectPage />
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
