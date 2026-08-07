import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

interface UserMetaData {
  os_id: string;
  username: string;
  app_version: string;
}

/** True when running inside the Tauri webview (IPC available). */
const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/** Component renders a TauriAppFooter */
const TauriAppFooter = () => {
  const [metadata, setMetadata] = useState<UserMetaData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getUserMetadata = async () => {
      if (!isTauri()) return;

      try {
        const data = await invoke<UserMetaData>("get_user_metadata");
        if (isMounted) {
          setMetadata(data ?? null);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Tauri metadata error:", err);
        }
      }
    };

    getUserMetadata();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!metadata) {
    return <div className="h-6" />;
  }

  return (
    <div className="fixed bottom-3 left-4 right-4 flex items-center justify-between text-sm">
      <p className="text-muted-foreground">Version {metadata.app_version || "NA"}</p>

      <div className="flex items-center gap-2">
        <p className="text-muted-foreground">
          <span className="opacity-80">User:</span> <span>{metadata.username || "NA"}</span>
        </p>

        <span className="text-muted-foreground">.</span>

        <p className="text-muted-foreground">
          <span className="opacity-80">OS ID:</span> <span>{metadata.os_id || "NA"}</span>
        </p>
      </div>
    </div>
  );
};

export { TauriAppFooter };
