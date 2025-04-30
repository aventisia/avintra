import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";

import { Suspense } from "react";
import { Outlet } from "react-router-dom";

const AccountsUILayout = () => {
  return (
    <main className="flex h-screen justify-center">
      <div className="flex h-fit min-h-screen w-full space-x-2 overflow-auto">
        <Suspense fallback={<RedirectPage />}>
          <Outlet />
        </Suspense>
      </div>
    </main>
  );
};

export { AccountsUILayout };
