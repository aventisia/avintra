import { useEffect, useRef, useState } from "react";

/**
 * useWebSocket
 *
 * Initializes and manages a WebSocket connection using the native WebSocket API.
 *
 * @param url - WebSocket endpoint.
 * @param shouldConnect - Controls whether the connection should be established.
 *
 * @returns socket - The active WebSocket instance (or null).
 * @returns isReady - True when the connection is successfully established.
 */
export default function useWebSocket({
  url,
  shouldConnect = true,
}: {
  url: string;
  shouldConnect: boolean;
}) {
  // Stores the WebSocket instance to persist between renders.
  const socketRef = useRef<WebSocket | null>(null);

  // Indicates whether the WebSocket connection is ready.
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Skip if connection shouldn't be established.
    if (!shouldConnect) return;

    // Avoid creating multiple WebSocket connections.
    if (socketRef.current) return;

    // Create a new WebSocket connection.
    const socket = new WebSocket(url);

    // Set up event listeners for WebSocket events.
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket Connected");
      setIsReady(true);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
      setIsReady(false);
    };

    // Cleanup when component unmounts or parameters change.
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setIsReady(false);
      }
    };
  }, [shouldConnect, url]);

  return {
    socket: socketRef.current,
    isReady,
  };
}
