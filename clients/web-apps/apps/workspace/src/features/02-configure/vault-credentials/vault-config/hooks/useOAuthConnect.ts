import { useCallback } from "react";

import { getOAuthConnectionStatus } from "../../apis/vaults-table-apis";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 60;

/**
 * Helpers for the Corsair OAuth connect flow.
 *
 * The popup MUST be opened synchronously within a user gesture (e.g. the form
 * submit handler) to avoid browser popup blockers. Once the backend returns the
 * connect URL, the already-open popup is navigated to it and the status endpoint
 * is polled until consent completes.
 */
export const useOAuthConnect = () => {
  /**
   * Opens a popup synchronously. If an initial URL is provided, the popup is
   * loaded with it immediately; otherwise it opens to about:blank and can be
   * navigated later via navigateOAuthPopup.
   *
   * Call this inside a user gesture handler to avoid browser popup blockers.
   * Returns the popup reference, or null if the browser blocked it.
   */
  const openOAuthPopup = useCallback((initialUrl?: string): Window | null => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      initialUrl ?? "about:blank",
      "corsair-oauth",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!popup || popup.closed) {
      console.warn("OAuth popup was blocked by the browser.");
    }

    return popup;
  }, []);

  /**
   * Navigates an already-open popup to the OAuth connect URL. If the popup was
   * closed or blocked, opens the URL in a new tab/window as a fallback.
   */
  const navigateOAuthPopup = useCallback((popup: Window | null, url: string) => {
    if (popup && !popup.closed) {
      popup.location.replace(url);
      return popup;
    }
    return window.open(url, "corsair-oauth");
  }, []);

  /**
   * Polls the backend status endpoint until the OAuth connection is established
   * or the timeout is reached. Returns true when connected, false on timeout or
   * when the popup is closed before completion.
   *
   * Also listens for a postMessage from the OAuth callback landing page so the
   * popup can signal completion without relying solely on polling.
   */
  const pollOAuthStatus = useCallback(
    (vaultCredentialId: string, popup: Window | null): Promise<boolean> => {
      return new Promise((resolve) => {
        let attempts = 0;

        const cleanup = () => {
          window.removeEventListener("message", onMessage);
          window.clearInterval(interval);
        };

        const onMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          const data = event.data;
          if (data?.type !== "OAUTH_CALLBACK") return;
          if (data.credentialId && data.credentialId !== vaultCredentialId) return;

          cleanup();
          resolve(Boolean(data.success) && !data.error);
        };

        window.addEventListener("message", onMessage);

        const interval = window.setInterval(async () => {
          attempts += 1;

          if (popup?.closed) {
            cleanup();
            resolve(false);
            return;
          }

          if (attempts > MAX_POLL_ATTEMPTS) {
            cleanup();
            resolve(false);
            return;
          }

          try {
            const response = await getOAuthConnectionStatus(vaultCredentialId);
            if (response?.data?.connected) {
              cleanup();
              resolve(true);
            }
          } catch {
            // IMPORTANT NOTE: Transient polling errors are ignored so the poll keeps retrying.
          }
        }, POLL_INTERVAL_MS);
      });
    },
    [],
  );

  return { openOAuthPopup, navigateOAuthPopup, pollOAuthStatus };
};
