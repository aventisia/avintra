import { cn } from "@/react-toolkit/lib/utils";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { Outlet } from "react-router-dom";
import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
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
          <ScrollArea className="h-[calc(100vh-var(--header-height)-1px)]">
            {/* added bg for main*/}
            <main className={cn("px-7 py-0 transition-[margin] duration-500")}>
              <Outlet />
            </main>
          </ScrollArea>
        </div>
      )}
    </>
  );
};
