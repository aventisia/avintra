import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useLoginStore } from "../../stores/login-store";
import { IOSInfo } from "../../types/os-info";

const DisplayOSInfo = () => {
  // Check if running in Tauri
  const isTauri = "isTauri" in window;

  const { osInfo, setOsInfo } = useLoginStore(
    useShallow((state) => ({
      osInfo: state.osInfo,
      setOsInfo: state.setOsInfo,
    })),
  );

  useEffect(() => {
    const checkEnvironment = async () => {
      if (isTauri) {
        try {
          const currOSInfo = (await invoke("get_os_info")) as unknown as {
            os_id: string;
            username: string;
          };

          const extractedOSInfo = {
            osId: currOSInfo.os_id,
            hostname: currOSInfo.username,
          } as IOSInfo;

          setOsInfo(extractedOSInfo || null);
        } catch (err) {
          console.log("OS Info error:", err);
        }
      }
    };

    checkEnvironment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isTauri) return null;

  return (
    <p className="text-muted-foreground text-center text-md w-full">
      {`(os_id: ${osInfo?.osId ? osInfo?.osId : "NA"}, hostname/username: ${osInfo?.hostname ? osInfo?.hostname : "NA"})`}
    </p>
  );
};

export default DisplayOSInfo;
