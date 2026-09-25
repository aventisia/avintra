import { logOffFromCurrentSession } from "@avplatform/ui/apis";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { ACTIVITY_EVENTS, IDLE_TIMEOUT_MINUTES } from "@/constants/auto-logout";

// TODO: Save timer in localstorage or some better place where all browser tabs can access the same value. if agent is in execution state then auto logout should not trigger
export function useAutoLogout() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setUserSession } = useUserSessionStore(
    useShallow((state) => ({ setUserSession: state.setUserSession })),
  );
  const navigate = useNavigate();

  // Debounce function to delay calling the resetTimer function
  const debouncedResetTimer = useCallback(() => {
    // Clear previous debounce timeout if any
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    // Set a new debounce timeout
    debounceTimeoutRef.current = setTimeout(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(handleLogout, IDLE_TIMEOUT_MINUTES);
    }, 500); // debounce delay
  }, []);

  const handleLogout = async () => {
    try {
      await logOffFromCurrentSession();
      // Clear the Super Admin tenant-switch flag so the next session refresh is not
      // mistakenly routed to the tenant-switch endpoint.
      localStorage.removeItem("tenant_switch");
      localStorage.setItem("logout", "true");
      setUserSession(null);
      navigate("/redirect?msg=Logging out...&url=" + import.meta.env.VITE_ACCOUNTS_PATH);
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  useEffect(() => {
    // Attach debounced resetTimer to each event
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, debouncedResetTimer));

    // Start the timer initially
    debouncedResetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, debouncedResetTimer));
    };
  }, [debouncedResetTimer]);

  // Multi-tab logout support
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "logout" && e.newValue === "true") {
        window.location.href = "/login";
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);
}
