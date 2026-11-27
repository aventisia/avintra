import { getMySession } from "@avplatform/ui/apis/accounts-me-apis";
import { useMutation, useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";

import { forgetDesktopIntent, getDesktopIntent } from "@/constants/desktop-intent.util";

import { mintDesktopSignInCode } from "../apis/desktop-sign-in.apis";

const buildLoopbackUrl = (port: string, code: string, state: string): string => {
  const url = new URL(`http://127.0.0.1:${port}/`);
  url.searchParams.set("code", code);
  url.searchParams.set("state", state);
  return url.toString();
};

const readSessionEmail = (accessToken: string | undefined): string => {
  try {
    return jwtDecode<{ uname?: string }>(accessToken ?? "").uname ?? "";
  } catch {
    return "";
  }
};

/**
 * Reads the browser session of the confirmation screen and, on "Continue", mints a code and hands
 * it to the desktop app.
 */
const useDesktopConfirm = () => {
  const intent = getDesktopIntent();

  const {
    data: session,
    isPending: isSessionPending,
    isError: isSessionError,
  } = useQuery({
    queryKey: ["DESKTOP_SIGN_IN_SESSION"],
    queryFn: getMySession,
    retry: false,
  });

  const {
    mutate: confirm,
    isPending,
    error,
  } = useMutation({
    mutationFn: async () => {
      if (!intent) throw new Error("This desktop sign-in link is not valid.");

      const mintResponse = await mintDesktopSignInCode({
        state: intent.state,
        codeChallenge: intent.challenge,
        redirectUri: `http://127.0.0.1:${intent.port}/`,
      });

      const code = mintResponse.data?.code;
      if (!code) throw new Error(mintResponse.message || "Could not start the desktop sign-in.");

      forgetDesktopIntent();
      window.location.assign(buildLoopbackUrl(intent.port, code, intent.state));
    },
  });

  return {
    intent,
    email: readSessionEmail(session?.data?.accessToken),
    isSessionPending,
    isSessionError,
    confirm,
    isPending,
    error,
  };
};

export { useDesktopConfirm };
