import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";

interface JobNotification {
  jobId: string;
  status: string;
  message?: string;
  timestamp: string;
}

interface UseJobNotificationsReturn {
  isConnected: boolean;
  lastNotification: JobNotification | null;
  connectionError: string | null;
}

/**
 * Custom hook for connecting to SignalR job notification hub and receiving real-time job updates.
 * Automatically connects when component mounts and disconnects on unmount.
 */
export const useJobNotifications = (
  onJobCompleted?: (notification: JobNotification) => void,
  onJobProgress?: (notification: JobNotification) => void,
): UseJobNotificationsReturn => {
  // State to track connection status
  const [isConnected, setIsConnected] = useState(false);

  // State to hold the last received notification
  const [lastNotification, setLastNotification] =
    useState<JobNotification | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);

  // Store callbacks in refs to avoid re-running effect when they change
  const onJobCompletedRef = useRef(onJobCompleted);
  const onJobProgressRef = useRef(onJobProgress);

  // Update refs when callbacks change
  useEffect(() => {
    onJobCompletedRef.current = onJobCompleted;
    onJobProgressRef.current = onJobProgress;
  }, [onJobCompleted, onJobProgress]);

  useEffect(() => {
    let isMounted = true;

    const hubUrl = `${import.meta.env.VITE_WORKSPACE_API_PATH}/hubs/flow-execution`;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        withCredentials: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: () => 5000,
      })
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = connection;

    connection.on("JobCompleted", (notification: JobNotification) => {
      if (isMounted) {
        setLastNotification(notification);
        onJobCompletedRef.current?.(notification);
      }
    });

    connection.on("JobProgress", (notification: JobNotification) => {
      if (isMounted) {
        setLastNotification(notification);
        onJobProgressRef.current?.(notification);
      }
    });

    connection.onreconnecting(() => {
      if (isMounted) {
        setIsConnected(false);
        setConnectionError("Reconnecting...");
      }
    });

    connection.onreconnected(() => {
      if (isMounted) {
        setIsConnected(true);
        setConnectionError(null);
      }
    });

    connection.onclose((error: Error | undefined) => {
      if (isMounted) {
        setIsConnected(false);
        setConnectionError(error?.message || "Connection closed");
      }
    });

    const startConnection = async () => {
      try {
        await connection.start();
        if (isMounted) {
          setIsConnected(true);
          setConnectionError(null);
        }
      } catch (error) {
        if (isMounted && !(error instanceof Error && error.name === "AbortError")) {
          setConnectionError(
            error instanceof Error ? error.message : "Failed to connect",
          );
          setIsConnected(false);
        }
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    lastNotification,
    connectionError,
  };
};
