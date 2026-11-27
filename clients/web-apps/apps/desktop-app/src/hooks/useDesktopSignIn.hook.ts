import { IS_TAURI } from "@avplatform/ui/constants";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useCallback, useEffect, useState } from "react";

const POLL_INTERVAL_MS = 1000;

/** Loopback attempt started by the desktop shell, with the browser URL that continues it. */
export interface DesktopSignInAttempt {
  port: number;
  state: string;
  challenge: string;
  browserUrl: string;
}

interface DesktopSignInStart {
  port: number;
  state: string;
  challenge: string;
}

interface DesktopSignInDelivery {
  code: string;
  verifier: string;
}

interface UserMetadata {
  hostname: string;
}

async function readComputerName(): Promise<string> {
  if (!IS_TAURI) return "this computer";

  try {
    const metadata = await invoke<UserMetadata>("get_user_metadata");
    return metadata.hostname?.trim() || "this computer";
  } catch {
    return "this computer";
  }
}

function buildSignInUrl(appBaseUrl: string, started: DesktopSignInStart, computer: string): string {
  const url = new URL("/accounts/login", appBaseUrl);
  url.searchParams.set("intent", "desktop");
  url.searchParams.set("state", started.state);
  url.searchParams.set("challenge", started.challenge);
  url.searchParams.set("port", String(started.port));
  url.searchParams.set("computer", computer);
  return url.toString();
}

function buildCallbackUrl(
  appBaseUrl: string,
  state: string,
  delivery: DesktopSignInDelivery,
): string {
  // IMPORTANT NOTE: the exchange landing runs on the service origin and cannot reach the desktop
  // shell, so the PKCE verifier travels in this URL's fragment; fragments never reach a server,
  // proxy log or Referer, and the code it belongs to is single use.
  const url = new URL("/accounts/desktop/callback", appBaseUrl);
  // IMPORTANT NOTE: `origin` is the string "null" for tauri:// pages, so rebuild it from its parts.
  url.searchParams.set("shellOrigin", `${window.location.protocol}//${window.location.host}`);
  url.hash = new URLSearchParams({
    code: delivery.code,
    state,
    verifier: delivery.verifier,
  }).toString();
  return url.toString();
}

/**
 * Starts one loopback desktop sign-in attempt, opens the browser and polls for the delivered code.
 */
export function useDesktopSignIn(appBaseUrl: string, onDelivered: (url: string) => void) {
  const [attempt, setAttempt] = useState<DesktopSignInAttempt | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    if (!IS_TAURI) {
      setError("Open the desktop app to sign in.");
      return null;
    }

    setIsStarting(true);
    setError(null);

    try {
      const started = await invoke<DesktopSignInStart>("start_desktop_sign_in", { appBaseUrl });
      const computer = await readComputerName();
      const browserUrl = buildSignInUrl(appBaseUrl, started, computer);
      await openUrl(browserUrl);
      const next: DesktopSignInAttempt = { ...started, browserUrl };
      setAttempt(next);
      return next;
    } catch (err) {
      await invoke("cancel_desktop_sign_in").catch(() => undefined);
      setError(
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : "Could not open the browser. Please try again.",
      );
      return null;
    } finally {
      setIsStarting(false);
    }
  }, [appBaseUrl]);

  const cancel = useCallback(async () => {
    setAttempt(null);
    setError(null);

    if (!IS_TAURI) return;

    try {
      await invoke("cancel_desktop_sign_in");
    } catch {
      // The attempt is already dropped from the UI; nothing else to undo.
    }
  }, []);

  const openBrowserAgain = useCallback(async () => {
    if (!attempt) return;

    try {
      await openUrl(attempt.browserUrl);
    } catch {
      setError("Could not open the browser. Please try again.");
    }
  }, [attempt]);

  useEffect(() => {
    if (!attempt || !IS_TAURI) return;

    const timer = window.setInterval(async () => {
      try {
        const delivery = await invoke<DesktopSignInDelivery | null>("get_desktop_sign_in_code");
        if (!delivery) return;

        window.clearInterval(timer);
        setAttempt(null);
        onDelivered(buildCallbackUrl(appBaseUrl, attempt.state, delivery));
      } catch {
        // Keep polling until the attempt is delivered or cancelled.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [attempt, appBaseUrl, onDelivered]);

  return { attempt, isStarting, error, start, cancel, openBrowserAgain };
}
