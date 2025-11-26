import { IS_TAURI } from "@/constants/constants";

import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useLoginStore } from "../../stores/login-store";
import { IOSInfo } from "../../types/os-info";

const DisplayOSInfo = () => {
  const { osInfo, setOsInfo } = useLoginStore(
    useShallow((state) => ({
      osInfo: state.osInfo,
      setOsInfo: state.setOsInfo,
    })),
  );

  useEffect(() => {
    const checkEnvironment = async () => {
      if (IS_TAURI) {
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

  if (!IS_TAURI) return null;

  return (
    <div className=" flex flex-col gap-1 w-full">
      <p className="text-muted-foreground text-center text-md ">
        {`os_id: ${osInfo?.osId ? osInfo?.osId : "NA"}`}
      </p>
      <p className="text-muted-foreground text-center text-md ">
        {`username: ${osInfo?.hostname ? osInfo?.hostname : "NA"}`}
      </p>
    </div>
  );
};

export default DisplayOSInfo;
