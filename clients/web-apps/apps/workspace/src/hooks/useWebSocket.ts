import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useEffect, useState } from "react";

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
  // Keep the active HubConnection in state so React re-renders consumers
  // once the connection is established and listeners can be registered.
  const [connection, setConnection] = useState<HubConnection | null>(null);

  // Indicates whether the WebSocket connection is ready.
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Skip if connection shouldn't be established.
    if (!shouldConnect) return;

    // Avoid creating multiple connections.
    if (connection) return;

    // Build the SignalR connection.
    const newConnection = new HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection);

    // Start connection.
    newConnection
      .start()
      .then(() => {
        console.log("WebSocket Connected");
        setIsReady(true);
      })
      .catch((err) => console.error("WebSocket connection failed:", err));

    // Cleanup when component unmounts or parameters change.
    return () => {
      newConnection.stop();
      setConnection(null);
      setIsReady(false);
    };
  }, [shouldConnect, url, connection]);

  return {
    connection,
    isReady,
  };
}
