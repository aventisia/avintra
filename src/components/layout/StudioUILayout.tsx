import { Outlet } from "react-router-dom";
import { cn } from "@/react-toolkit/lib";
import { StudioHeader } from "./StudioHeader";

export const StudioUILayout = () => {
  return (
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
  );
};
