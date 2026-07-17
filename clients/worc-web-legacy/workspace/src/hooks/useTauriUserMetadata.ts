import { IS_TAURI } from "@aventisia/ui/constants";
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTuariUserMetadataStore } from "@/stores/tuari-user-metadata-store";

/**
 * useTauriUserMetadata
 *
 * Fetches and stores user metadata from Tauri backend using the `get_user_metadata` Tauri command.
 *
 * This hook is designed to only run when the app is running in Tauri,
 *
 * @returns void
 */
export default function useTauriUserMetadata() {
  const { setTuariUserMetadata } = useTuariUserMetadataStore(
    useShallow((state) => ({
      setTuariUserMetadata: state.setTuariUserMetadata,
    })),
  );

  useEffect(() => {
    // Early return if not in Tauri environment
    if (!IS_TAURI) return;

    const getUserMetadata = async () => {
      try {
        // Invoke Tauri command to get user metadata
        const data = (await invoke("get_user_metadata")) as {
          os_id: string;
          username: string;
          app_version: string;
        } | null;

        // Store the metadata
        setTuariUserMetadata(
          data
            ? {
                osID: data?.os_id,
                appVersion: data?.app_version,
                hostname: data?.username,
              }
            : null,
        );
      } catch (err) {
        // Error logging
        console.error("Failed to fetch Tuari user metadata:", err);
      }
    };

    // Fetch metadata on mount
    getUserMetadata();
  }, [setTuariUserMetadata]);
}
