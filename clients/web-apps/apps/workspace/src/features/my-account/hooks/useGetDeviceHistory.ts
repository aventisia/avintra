import type { UserSessionDto } from "@avplatform/ui/dtos/response/user-session-dto";
import { useEffect, useState } from "react";

import { getMySession } from "@/react-toolkit/apis/accounts-me-apis";

import { browserImages } from "../constants/browsers";
import type { ActiveSessionDto } from "../dtos/active-session-dto";
import { useFetchActiveSessions } from "./useFetchActiveSessions";

const getImageSourceOfBrowser = (browserType: string) => {
  const src = browserImages.find((f) => browserType.includes(f.name));
  return src?.image;
};

const useGetDeviceHistory = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState<ActiveSessionDto[]>([]);
  const [currentSession, setCurrentSession] = useState<UserSessionDto>();
  const { data: activeSessionsData } = useFetchActiveSessions();
  useEffect(() => {
    const fetchGetMyAccountInfo = async () => {
      setIsLoading(true);
      try {
        const { data: currentSessionsData } = await getMySession();
        if (activeSessionsData) setActiveSessions(activeSessionsData?.data);
        setCurrentSession(currentSessionsData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGetMyAccountInfo();
  }, [activeSessionsData]);
  return {
    isLoading,
    activeSessions,
    currentSession,
    getImageSourceOfBrowser,
  };
};

export default useGetDeviceHistory;
