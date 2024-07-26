import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { cn } from "@/react-toolkit/lib/utils";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { Outlet } from "react-router-dom";
import { StudioHeader } from "./StudioHeader";

export const StudioUILayout = () => {
  // Validate user session
  const { isPending } = useValidateUserSession();

  return (
    <>
      {isPending ? (
        <RedirectPage />
      ) : (
        <div className="relative flex min-h-screen flex-col items-center">
          <StudioHeader />
          <main
            className={cn(
              "h-[calc(100vh-3.1rem)] w-full overflow-hidden rounded-t-xl border",
            )}
          >
            <Outlet />
          </main>
        </div>
      )}
    </>
  );
};
