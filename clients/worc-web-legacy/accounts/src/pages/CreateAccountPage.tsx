import { IS_TAURI } from "@aventisia/ui/constants";
import { useEffect } from "react";

import { CreateAccountMain } from "@/features/sign-up/components/CreateAccountMain";

export default function CreateAccountPage() {
  // Check if the app is running in the Tauri desktop environment.
  // If true, redirect the user to the login page to restrict access to the create-account route.
  useEffect(() => {
    if (IS_TAURI) {
      // Redirect to the login page.
      window.location.assign(import.meta.env.VITE_ACCOUNTS_PATH);
    }
  }, []);

  return <CreateAccountMain />;
}
