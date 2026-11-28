import { LoadingSpinner } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { getSessionEndedUrl } from "@avplatform/ui/utils";

import { AuthShell, AuthStepLayout } from "@/features/auth";

import { useDesktopCallback } from "../hooks/useDesktopCallback.hook";

/** The same-origin landing that exchanges the fragment's code and opens the workspace. */
const DesktopCallback = () => {
  const state = useDesktopCallback();

  return (
    <AuthShell>
      {state.status === "failed" ? (
        <AuthStepLayout title="We couldn't finish signing you in" description={state.message}>
          <a
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full")}
            href={getSessionEndedUrl()}
          >
            Return to the desktop app
          </a>
        </AuthStepLayout>
      ) : (
        <div
          role="status"
          className="flex w-full max-w-[360px] items-center gap-3 text-body text-ink-2"
        >
          <LoadingSpinner className="size-5 text-live" />
          Signing you in…
        </div>
      )}
    </AuthShell>
  );
};

export { DesktopCallback };
