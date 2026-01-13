import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { getMySession } from "@/react-toolkit/apis/accounts-me-apis";

import { useGAAuthStore } from "../stores/useGAAuthStore";

export default function GALayout() {
  const { token, setToken } = useGAAuthStore(
    useShallow((state) => ({
      token: state.token,
      setToken: state.setToken,
    })),
  );

  useEffect(() => {
    if (token) return;

    const init = async () => {
      try {
        const session = await getMySession();
        if (session.data) setToken(session.data.accessToken);
      } catch {
        console.log("GALayout: Failed to get session");
      }
    };

    init();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!token) return <div></div>;

  return <Outlet />;
}
