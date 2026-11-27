import { markFreshLogin, setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { resolvePostLoginDestination } from "@/constants/post-login-destination";

import { exchangeDesktopSignInCode } from "../apis/desktop-sign-in.apis";
import { getDesktopCallbackValues, getExchangeErrorMessage } from "../utils/desktop-callback.util";

type CallbackState = { status: "working" | "failed"; message: string };

// IMPORTANT NOTE: the code is single use, so it is exchanged once per page load even when
// StrictMode replays the mount effect.
let hasStarted = false;

const dispatchToWorkspace = (email: string) => {
  markFreshLogin();
  window.location.assign(resolvePostLoginDestination(email));
};

/** Exchanges the captured code for a session and lands the webview on the workspace. */
const useDesktopCallback = () => {
  const [state, setState] = useState<CallbackState>({ status: "working", message: "" });

  const { mutate } = useMutation({
    mutationFn: exchangeDesktopSignInCode,
    onSuccess: ({ data }) => {
      const userSession = setUserSessionLocally(data);
      dispatchToWorkspace(userSession.email);
    },
    onError: (error) => {
      setState({ status: "failed", message: getExchangeErrorMessage(error) });
    },
  });

  useEffect(() => {
    if (hasStarted) return;
    hasStarted = true;

    const values = getDesktopCallbackValues();
    if (!values) {
      setState({ status: "failed", message: "This sign-in link is not valid." });
      return;
    }

    mutate({ code: values.code, state: values.state, codeVerifier: values.verifier });
  }, [mutate]);

  return state;
};

export { useDesktopCallback };
