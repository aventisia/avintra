import { Button } from "@avplatform/ui/buttons";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { DownloadIcon, MonitorIcon } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { AppLogo } from "./AppLogo";

/**
 * GetDesktop Component
 *
 * This component displays a full-screen notice instructing users to access
 * the app via the desktop client. It includes a call-to-action (CTA) button
 * to download the desktop application and redirects users if they are not
 * eligible to access the desktop app.
 *
 * Conditions:
 * - Only users with the "TU" role and no other roles can access the app.
 */
const GetDesktop = () => {
  const navigate = useNavigate();

  // Access the current user session from the store
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  useEffect(() => {
    // Check if the user has the "TU" role and no other roles
    const hasSingleTU =
      userSession?.userRoles.includes("TU") && userSession?.userRoles.length === 1;

    // If the user does not meet the condition, redirect to the home page
    if (!hasSingleTU) {
      navigate("/");
    }
  }, [userSession?.userRoles, navigate]);

  return (
    <div className="flex min-h-screen flex-col p-3">
      {/* Header Section */}
      <header className="p-5 xs:p-6">
        <div className="flex items-center">
          <AppLogo logoSrc="/logo.svg" />
        </div>
      </header>

      {/* Main Section */}
      <main className="-mt-4 flex flex-1 items-center justify-center px-4">
        <section className="max-w-md text-center">
          {/* Icon and Text Description */}
          <div className="mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <MonitorIcon className="h-12 w-12 text-white" />
            </div>

            <h1 className="mb-4 text-3xl font-bold">Desktop Access Only</h1>

            <p className="text-lg text-muted-foreground">
              Please launch the desktop application to sign in and access your workspace.
            </p>
          </div>

          {/* CTA Button for Downloading Desktop Application */}
          <Button
            onClick={() => {
              window.open(
                `${import.meta.env.VITE_ACCOUNTS_API_PATH}/desktop-app/download/`,
                "_blank",
              );
            }}
            className="mx-auto flex items-center gap-2"
          >
            <DownloadIcon className="h-5 w-5" />
            Download for Desktop
          </Button>

          {/* Optional Information  */}
          {/* <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
            <span>Windows</span>
            <span>•</span>
            <span>Linux</span>
          </div> */}
        </section>
      </main>
    </div>
  );
};

export { GetDesktop };
