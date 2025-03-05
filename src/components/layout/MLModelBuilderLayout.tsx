import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { cn } from "@/react-toolkit/lib/utils";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { Outlet } from "react-router-dom";
import { MLModelBuilderHeader } from "./MLModelBuilderHeader";

export const MLModelBuilderLayout = () => {
  // Validate user session
  const { isPending } = useValidateUserSession();

  return (
    <>
      {isPending ? (
        <RedirectPage />
      ) : (
        <div className="relative min-h-screen overflow-hidden bg-slate-100">
          <MLModelBuilderHeader />
          <ScrollArea className="h-[calc(100vh-4.5rem)]">
            {/* added bg for main*/}
            <main
              className={cn(
                "h-[calc(100vh-4.5rem)] p-2 py-0 transition-[margin] duration-500",
              )}
            >
              <Outlet />
            </main>
          </ScrollArea>
        </div>
      )}
    </>
  );
};
