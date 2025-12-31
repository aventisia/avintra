import { IS_TAURI } from "@/constants/constants";
import { CreateAccountMain } from "@/features/sign-up/components/CreateAccountMain";

import { useEffect } from "react";

export default function CreateAccountPage() {
  // Check if the app is running in the Tauri desktop environment.
  // If true, redirect the user to the login page to restrict access to the create-account route.
  useEffect(() => {
    if (IS_TAURI) {
      // Redirect to the login page.
      window.location.assign(import.meta.env.VITE_LOGIN_URL);
    }
  }, []);

  return <CreateAccountMain />;
}
