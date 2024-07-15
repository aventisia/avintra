import { Outlet } from "react-router-dom";
import { cn } from "@/react-toolkit/lib";
import { StudioHeader } from "./StudioHeader";
import { RedirectPage } from "@/react-toolkit/pages";
import { useValidateUserSession } from "@/react-toolkit/hooks";

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
