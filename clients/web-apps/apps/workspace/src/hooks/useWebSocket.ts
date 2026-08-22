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
  // Keep the active HubConnection in state so React re-renders consumers
  // once the connection is established and listeners can be registered.
  const [connection, setConnection] = useState<HubConnection | null>(null);

  // Indicates whether the WebSocket connection is ready.
  const [isReady, setIsReady] = useState(false);

  // Track whether we are already building a connection for the current URL so
  // the effect does not recreate one when connection state changes.
  const isConnectingRef = useRef(false);

  useEffect(() => {
    // Skip if connection shouldn't be established.
    if (!shouldConnect) return;

    // Avoid creating multiple connections.
    if (connection || isConnectingRef.current) return;

    isConnectingRef.current = true;

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
      .catch((err) => {
        console.error("WebSocket connection failed:", err);
        isConnectingRef.current = false;
      });

    // Cleanup when component unmounts or parameters change.
    return () => {
      newConnection.stop();
      setConnection(null);
      setIsReady(false);
      isConnectingRef.current = false;
    };
  }, [shouldConnect, url]);

  return {
    connection,
    isReady,
  };
}
