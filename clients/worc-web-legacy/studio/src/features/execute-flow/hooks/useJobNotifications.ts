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

    // Get the base URL from environment or window location
    const hubUrl = `${import.meta.env.VITE_WORKSPACE_API_PATH}/hubs/flow-execution`;

    // Build the SignalR connection
    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        withCredentials: true, // Send cookies (including HttpOnly JWT) with WebSocket handshake
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: () => 5000, // Retry every 5 seconds
      })
      .configureLogging(LogLevel.Information)
      .build();

    console.log("Attempting to connect to SignalR hub at:", hubUrl);

    // Set up event handlers
    connection.on("JobCompleted", (notification: JobNotification) => {
      console.log("Job completed notification received:", notification);
      if (isMounted) {
        setLastNotification(notification);
        onJobCompletedRef.current?.(notification);
      }
    });

    connection.on("JobProgress", (notification: JobNotification) => {
      console.log("Job progress notification received:", notification);
      if (isMounted) {
        setLastNotification(notification);
        onJobProgressRef.current?.(notification);
      }
    });

    // Handle connection state changes
    connection.onreconnecting(() => {
      console.log("SignalR reconnecting...");
      if (isMounted) {
        setIsConnected(false);
        setConnectionError("Reconnecting...");
      }
    });

    connection.onreconnected(() => {
      console.log("SignalR reconnected successfully");
      if (isMounted) {
        setIsConnected(true);
        setConnectionError(null);
      }
    });

    connection.onclose((error: Error | undefined) => {
      console.log("SignalR connection closed", error);
      if (isMounted) {
        setIsConnected(false);
        setConnectionError(error?.message || "Connection closed");
      }
    });

    // Start the connection
    const startConnection = async () => {
      try {
        await connection.start();
        console.log("SignalR connected successfully to job notification hub");
        if (isMounted) {
          setIsConnected(true);
          setConnectionError(null);
        }
      } catch (error) {
        console.error("Error connecting to SignalR:", error);
        if (isMounted) {
          setConnectionError(
            error instanceof Error ? error.message : "Failed to connect",
          );
          setIsConnected(false);
        }
      }
    };

    startConnection();
    connectionRef.current = connection;

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (connectionRef.current) {
        console.log("Cleaning up SignalR connection...");
        connectionRef.current
          .stop()
          .then(() => console.log("SignalR connection stopped"))
          .catch((err: Error) =>
            console.error("Error stopping SignalR connection:", err),
          );
        connectionRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  return {
    isConnected,
    lastNotification,
    connectionError,
  };
};
