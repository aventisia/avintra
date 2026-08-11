import { DotSeparator } from "@avplatform/ui";
import { IS_TAURI } from "@avplatform/ui/constants";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

interface UserMetaData {
  os_id: string;
  username: string;
  hostname: string;
  app_version: string;
}
/** Component renders a TauriAppFooter */
const TauriAppFooter = () => {
  const [metadata, setMetadata] = useState<UserMetaData | null>(null);

  useEffect(() => {
    const getUserMetadata = async () => {
      if (IS_TAURI) {
        try {
          const data = (await invoke("get_user_metadata")) as unknown as UserMetaData;

          setMetadata(data || null);
        } catch (err) {
          console.log("Tuari metadata error:", err);
        }
      }
    };

    getUserMetadata();
  }, []);

  return (
    <>
      {metadata ? (
        <div className="flex  items-center w-full justify-between text-sm px-6 pb-1 xs:pb-0">
          <p className="text-slate-500">
            {`Version ${metadata?.app_version ? metadata?.app_version : "NA"}`}
          </p>
          <div className="flex items-center ">
            <p>
              <span className="text-slate-500/80">User:</span>{" "}
              <span className="text-slate-500">
                {metadata?.username ? metadata?.username : "NA"}
              </span>
            </p>
            <DotSeparator />
            <p>
              <span className="text-slate-500/80">OS ID:</span>{" "}
              <span className="text-slate-500">{metadata?.os_id ? metadata?.os_id : "NA"}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="h-6"></div>
      )}
    </>
  );
};

export { TauriAppFooter };
