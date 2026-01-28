import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

interface UserMetaData {
    os_id: string;
    username: string;
    app_version: string;
}

/** Component renders a TauriAppFooter */
const TauriAppFooter = () => {
    const [metadata, setMetadata] = useState<UserMetaData | null>(null);

    useEffect(() => {
        let isMounted = true;

        const getUserMetadata = async () => {
            //   if (!IS_TAURI) return;

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
        <div className="tauri-footer">
            <p className="footer-version">
                Version {metadata.app_version || "NA"}
            </p>

            <div className="footer-meta">
                <p>
                    <span className="footer-label">User:</span>{" "}
                    <span className="footer-value">
                        {metadata.username || "NA"}
                    </span>
                </p>

                <span className="dot-separator">.</span>

                <p>
                    <span className="footer-label">OS ID:</span>{" "}
                    <span className="footer-value">
                        {metadata.os_id || "NA"}
                    </span>
                </p>
            </div>
        </div>

    );
};

export { TauriAppFooter };
