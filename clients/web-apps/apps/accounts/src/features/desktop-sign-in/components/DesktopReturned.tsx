import { AuthShell, AuthStepLayout } from "@/features/auth";

/** The branded page the browser stays on after handing the sign-in back to the desktop app. */
const DesktopReturned = () => (
  <AuthShell>
    <AuthStepLayout
      title="You can return to the desktop app"
      description="Your browser sign-in is complete. You can close this tab."
    />
  </AuthShell>
);

export { DesktopReturned };
