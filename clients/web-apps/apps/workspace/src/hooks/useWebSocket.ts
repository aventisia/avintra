import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";

/**
 * useWebSocket
 *
 * Initializes and manages a WebSocket connection using @microsoft/signalr.
 *
 * @param url - WebSocket/SignalR hub endpoint.
 * @param shouldConnect - Controls whether the connection should be established.
 *
 * @returns connection - The active HubConnection instance (or null).
 * @returns isReady - True when the connection is successfully established.
 */
export default function useWebSocket({
  url,
  shouldConnect = true,
}: {
  url: string;
  shouldConnect: boolean;
}) {
  // Stores the HubConnection instance to persist between renders.
  const connectionRef = useRef<HubConnection | null>(null);

  // Indicates whether the WebSocket connection is ready.
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Skip if connection shouldn't be established.
    if (!shouldConnect) return;

    // Avoid creating multiple connections.
    if (connectionRef.current) return;

    // Build the SignalR connection.
    const connection = new HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // Start connection.
    connection
      .start()
      .then(() => {
        console.log("WebSocket Connected");
        setIsReady(true);
      })
      .catch((err) => console.error("WebSocket connection failed:", err));

    // Cleanup when component unmounts or parameters change.
    return () => {
      connection.stop();
      connectionRef.current = null;
      setIsReady(false);
    };
  }, [shouldConnect, url]);

  return {
    connection: connectionRef.current,
    isReady,
  };
}
