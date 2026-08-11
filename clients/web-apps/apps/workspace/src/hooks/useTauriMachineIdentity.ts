import { IS_TAURI } from "@avplatform/ui/constants";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

interface TauriMachineIdentity {
  osID: string;
  username: string;
  appVersion: string;
}

/**
 * Fetches the local machine identity from the Tauri shell when running inside
 * the desktop app. This is used only for WebSocket registration with the
 * orchestrator hub; it does not persist the values in a store.
 */
export function useTauriMachineIdentity() {
  const [identity, setIdentity] = useState<TauriMachineIdentity>({
    osID: "",
    username: "",
    appVersion: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!IS_TAURI) {
      setIsLoading(false);
      return;
    }

    const loadIdentity = async () => {
      try {
        const data = (await invoke("get_user_metadata")) as {
          os_id: string;
          username: string;
          app_version: string;
        };

        setIdentity({
          osID: data.os_id,
          username: data.username,
          appVersion: data.app_version,
        });
      } catch (err) {
        console.error("Failed to load Tauri machine identity:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadIdentity();
  }, []);

  return { ...identity, isLoading };
}
