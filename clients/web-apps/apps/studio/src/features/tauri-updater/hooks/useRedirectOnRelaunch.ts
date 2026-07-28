import { IS_TAURI } from "@avplatform/ui/constants";
import { LazyStore } from "@tauri-apps/plugin-store";
import { useEffect } from "react";

import { TAURI_RELAUNCH_URL_KEY, TAURI_UPDATE_STORE } from "..";

export const useRedirectOnRelaunch = () => {
  useEffect(() => {
    // Not a tauri app, skip update logic
    if (!IS_TAURI) return;

    const tauriUpdateStore = new LazyStore(TAURI_UPDATE_STORE);

    tauriUpdateStore.get<string>(TAURI_RELAUNCH_URL_KEY).then(async (url) => {
      if (url && url !== window.location.href) {
        // Remove the stored URL so it doesn't redirect again
        await tauriUpdateStore.delete(TAURI_RELAUNCH_URL_KEY);
        await tauriUpdateStore.save();

        // Redirect to the saved URL
        window.location.replace(url);
      }
    });
  }, []);
};
