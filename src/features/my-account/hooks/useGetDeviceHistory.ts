import { useEffect, useState } from "react";

import { getMySession } from "@/react-toolkit/apis/accounts-me-apis";
import type { UserSessionDto } from "@/react-toolkit/dtos/response/user-session-dto";

import { getActiveSessions } from "../apis/my-account-apis";
import { browserImages } from "../constants/browsers";
import type { ActiveSessionDto } from "../dtos/active-session-dto";

const getImageSourceOfBrowser = (browserType: string) => {
  const src = browserImages.find((f) => browserType.includes(f.name));
  return src?.image;
};

const useGetDeviceHistory = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState<ActiveSessionDto[]>([]);
  const [currentSession, setCurrentSession] = useState<UserSessionDto>();

  useEffect(() => {
    const fetchGetMyAccountInfo = async () => {
      setIsLoading(true);
      try {
        const { data: activeSessionsData } = await getActiveSessions();
        const { data: currentSessionsData } = await getMySession();

        setActiveSessions(activeSessionsData);
        setCurrentSession(currentSessionsData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGetMyAccountInfo();
  }, []);
  return {
    isLoading,
    activeSessions,
    currentSession,
    getImageSourceOfBrowser,
  };
};

export default useGetDeviceHistory;
