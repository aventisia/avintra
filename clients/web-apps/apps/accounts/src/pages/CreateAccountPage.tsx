import { IS_TAURI } from "@avplatform/ui/constants";
import { useEffect } from "react";

import { AuthMain } from "@/features/auth";

export default function CreateAccountPage() {
  // IMPORTANT NOTE: the desktop app signs in to existing accounts only, so sign-up sends it back to sign-in.
  useEffect(() => {
    if (IS_TAURI) window.location.assign(import.meta.env.VITE_ACCOUNTS_PATH);
  }, []);

  return <AuthMain intent="sign-up" />;
}
