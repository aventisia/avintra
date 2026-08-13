import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

interface UserMetaData {
  os_id: string;
  username: string;
  hostname: string;
  app_version: string;
}

/** True when running inside the Tauri webview (IPC available). */
const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/** Component renders a TauriAppFooter */
const TauriAppFooter = () => {
  const [metadata, setMetadata] = useState<UserMetaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getUserMetadata = async () => {
      if (!isTauri()) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await invoke<UserMetaData>("get_user_metadata");
        if (isMounted) {
          setMetadata(data ?? null);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Tauri metadata error:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getUserMetadata();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderMetadata = metadata ?? {
    app_version: "0.0.0-dev",
    username: "dev-user",
    hostname: "browser",
    os_id: "browser",
  };

  if (!isTauri() && !import.meta.env.DEV) {
    return null;
  }

  if (isLoading) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-between border-t border-border/50 bg-card/80 px-6 py-2.5 text-xs text-muted-foreground backdrop-blur-sm">
        <span>Loading metadata...</span>
      </footer>
    );
  }

  return (
    <footer className="fixed font-mono bottom-0 left-0 right-0 flex items-center justify-between border-t border-border/50 bg-card/80 px-6 py-2.5 text-xs text-muted-foreground backdrop-blur-sm">
      <span>
        <span className="opacity-70">Version</span>{" "}
        <span>{renderMetadata.app_version || "NA"}</span>
      </span>

      <div className="flex items-center gap-3">
        <span>
          <span className="opacity-70">Host:</span> <span>{renderMetadata.hostname || "NA"}</span>
        </span>
        <span className="opacity-40">·</span>
        <span>
          <span className="opacity-70">User:</span> <span>{renderMetadata.username || "NA"}</span>
        </span>
        <span className="opacity-40">·</span>
        <span>
          <span className="opacity-70">OS ID:</span> <span>{renderMetadata.os_id || "NA"}</span>
        </span>
      </div>
    </footer>
  );
};

export { TauriAppFooter };
