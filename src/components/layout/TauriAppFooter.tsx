import { IS_TAURI } from "@/constants/constants";

import { DotSeparator } from "@aventisia/ui";
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
    const getUserMetadata = async () => {
      if (IS_TAURI) {
        try {
          const currOSInfo = (await invoke(
            "get_user_metadata",
          )) as unknown as UserMetaData;

          setMetadata(currOSInfo || null);
        } catch (err) {
          setMetadata({
            username: "vaibhav",
            os_id: "1234-acda-2a3d-12ad-34cf",
            app_version: "0.2.1",
          });
          console.log("OS Info error:", err);
        }
      }
    };

    getUserMetadata();
  }, []);

  return (
    <div className="flex items-center w-full justify-between text-sm px-6 pb-1 text-muted-foreground xs:pb-0">
      <p className="text-muted-foreground text-center  ">
        {`v${metadata?.app_version ? metadata?.app_version : "NA"}`}
      </p>
      <div className="flex items-center ">
        <p className="text-muted-foreground text-center  ">
          {`User: ${metadata?.username ? metadata?.username : "NA"}`}
        </p>
        <DotSeparator />
        <p className="text-muted-foreground text-center  ">
          {`OS ID: ${metadata?.os_id ? metadata?.os_id : "NA"}`}
        </p>
      </div>
    </div>
  );
};

export { TauriAppFooter };
