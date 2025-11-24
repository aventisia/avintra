import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useLoginStore } from "../../stores/login-store";

const DisplayOSId = () => {
  const [id, setId] = useState<string>("");
  const [isTauri, setIsTauri] = useState(false);
  const { setOsId } = useLoginStore(
    useShallow((state) => ({
      setOsId: state.setOsId,
    })),
  );

  useEffect(() => {
    const checkEnvironment = async () => {
      // Check if running in Tauri
      const isInTauri = typeof window !== "undefined" && "isTauri" in window;
      setIsTauri(isInTauri);

      if (isInTauri) {
        try {
          const installationId = (await invoke(
            "get_os_installation_id",
          )) as string;
          setId(installationId || "");
          setOsId(installationId || "");
        } catch (err) {
          console.log("OS ID error:", err);
        }
      }
    };

    checkEnvironment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isTauri) return null;

  return (
    <p className="text-muted-foreground text-center text-md w-full">
      {`(os_id: ${id ? id : "NA"})`}
    </p>
  );
};

export default DisplayOSId;
