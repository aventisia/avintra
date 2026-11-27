import { Button } from "@avplatform/ui/buttons";
import { useNavigate } from "react-router-dom";

import { getDesktopLoginPath } from "@/constants/desktop-intent.util";
import { AuthShell, AuthStepLayout } from "@/features/auth";

import { useDesktopConfirm } from "../hooks/useDesktopConfirm.hook";

const errorMessage = (error: unknown): string =>
  typeof error === "string" ? error : (error as Error)?.message || "Please try again.";

/** Confirms the browser session, then hands the sign-in to the desktop app. */
const DesktopConfirm = () => {
  const navigate = useNavigate();
  const { intent, email, isSessionPending, isSessionError, confirm, isPending, error } =
    useDesktopConfirm();
  const signInPath = getDesktopLoginPath({ switchAccount: true }) ?? "/login";

  if (!intent) {
    return (
      <AuthShell>
        <AuthStepLayout
          title="This sign-in link is not valid"
          description="Open the sign-in again from the desktop app."
        >
          <Button type="button" size="lg" onClick={() => navigate("/login")}>
            Go to sign in
          </Button>
        </AuthStepLayout>
      </AuthShell>
    );
  }

  if (isSessionError) {
    return (
      <AuthShell>
        <AuthStepLayout title="Sign in again" description="Your browser session has ended.">
          <Button type="button" size="lg" onClick={() => navigate(signInPath)}>
            Sign in
          </Button>
        </AuthStepLayout>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthStepLayout
        title="Confirm desktop sign-in"
        description={
          isSessionPending
            ? "Checking your account…"
            : `Sign in to Avintra Desktop as ${email} on ${intent.computer}.`
        }
      >
        {error ? <p className="text-hint text-bad">{errorMessage(error)}</p> : null}
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={isPending || isSessionPending || !email}
          onClick={() => confirm()}
        >
          {isPending ? "Signing in…" : "Continue"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => navigate(signInPath)}
        >
          Use a different account
        </Button>
      </AuthStepLayout>
    </AuthShell>
  );
};

export { DesktopConfirm };
