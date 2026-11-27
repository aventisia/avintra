import { Navigate } from "react-router-dom";

import { getDesktopLoginPath } from "@/constants/desktop-intent.util";
import { AuthMain } from "@/features/auth";

export default function CreateAccountPage() {
  // IMPORTANT NOTE: the desktop app signs in to existing accounts only, so a hand-back never offers sign-up.
  const desktopLoginPath = getDesktopLoginPath();

  if (desktopLoginPath) return <Navigate to={desktopLoginPath} replace />;

  return <AuthMain intent="sign-up" />;
}
