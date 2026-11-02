import { getMySession } from "@avplatform/ui/apis/accounts-me-apis";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { setUserSessionLocally } from "@avplatform/ui/utils";
import { useEffect, useState } from "react";

import { useGAAuthStore } from "@/stores/useGAAuthStore.ee";

type AccessState = "pending" | "granted" | "denied";

const hasGlobalAdminAccess = (userSession: ReturnType<typeof setUserSessionLocally>) =>
  userSession.userRoles.includes("SA") && userSession.deploymentType === "Commercial";

export function useGlobalAdminSession() {
  const setUserSession = useUserSessionStore((state) => state.setUserSession);
  const setToken = useGAAuthStore((state) => state.setToken);
  const [access, setAccess] = useState<AccessState>("pending");

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      const session = await getMySession();
      if (cancelled || !session?.data) return;

      const userSession = setUserSessionLocally(session.data);
      setUserSession(userSession);
      setToken(session.data.accessToken);
      setAccess(hasGlobalAdminAccess(userSession) ? "granted" : "denied");
    };

    void loadSession().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [setToken, setUserSession]);

  useEffect(() => {
    if (access === "denied") window.location.assign(import.meta.env.VITE_WORKSPACE_PATH);
  }, [access]);

  return access;
}
