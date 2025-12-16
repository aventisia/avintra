import { HubConnection } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * useCheckMachineStatus
 *
 * Listens for machine status updates over a WebSocket connection
 * and invalidates the 'machines' query to fetch the latest data.
 *
 * @param {HubConnection | null} connection - The SignalR HubConnection instance.
 *
 * @example
 * useCheckMachineStatus(connection);
 */
export default function useCheckMachineStatus(
  connection: HubConnection | null,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Exit if no connection is provided
    if (!connection) {
      return;
    }

    // Handler for 'machine_status_update' event received from backend
    const handleMachineStatusUpdate = (data: unknown) => {
      console.log("WebSocket Message received:", data);

      // Invalidate the 'machines' query to fetch the latest data
      queryClient.invalidateQueries({ queryKey: ["select-agent"] });
      queryClient.invalidateQueries({ queryKey: ["machines-to-select"] });
      queryClient.invalidateQueries({ queryKey: ["machines"] });
    };

    // Subscribe to the machine status update event
    connection.on("machine_status_update", handleMachineStatusUpdate);

    // Cleanup listener on component unmount or connection change
    return () => {
      connection.off("machine_status_update", handleMachineStatusUpdate);
    };
  }, [connection, queryClient]);
}
