import { cn } from "@avplatform/ui/lib";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import { isTauriEnv } from "./lib/setupStore";

interface UserMetaData {
  os_id: string;
  username: string;
  hostname: string;
  app_version: string;
}

/** Component renders a TauriAppFooter */
const TauriAppFooter = () => {
  const [metadata, setMetadata] = useState<UserMetaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getUserMetadata = async () => {
      if (!isTauriEnv()) {
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

  if (!isTauriEnv() && !import.meta.env.DEV) {
    return null;
  }

  const footerClass =
    "fixed bottom-0 left-0 right-0 flex h-8 items-center justify-between border-t border-line bg-surface px-4 font-mono text-hint text-muted-foreground";

  if (isLoading) {
    return (
      <footer className={footerClass}>
        <span>Loading metadata...</span>
      </footer>
    );
  }

  return (
    <footer className={footerClass}>
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("size-1.5 rounded-full", metadata ? "bg-ok" : "bg-warn")} />
        <span className="text-ink-2">v{renderMetadata.app_version || "NA"}</span>
      </span>

      <div className="flex items-center gap-3">
        <span>
          host <span className="text-ink-2">{renderMetadata.hostname || "NA"}</span>
        </span>
        <span className="text-line-strong">·</span>
        <span>
          user <span className="text-ink-2">{renderMetadata.username || "NA"}</span>
        </span>
        <span className="text-line-strong">·</span>
        <span>
          os <span className="text-ink-2">{renderMetadata.os_id || "NA"}</span>
        </span>
      </div>
    </footer>
  );
};

export { TauriAppFooter };
