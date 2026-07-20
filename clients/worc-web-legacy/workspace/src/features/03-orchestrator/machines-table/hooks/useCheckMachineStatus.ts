import { HubConnection } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

// TODO: machine_tables feature refactor

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
export default function useCheckMachineStatus(connection: HubConnection | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Exit if no connection is provided
    if (!connection) {
      return;
    }

    // Handler for 'machine_status_update' event received from backend
    const handleMachineStatusUpdate = (data: unknown) => {
      console.log("machine_status_update received:", data);

      // Invalidate the 'machines' query to fetch the latest data
      queryClient.invalidateQueries({ queryKey: ["machines-to-select"] }); //Assigned Machines list (on Published table)
      queryClient.invalidateQueries({ queryKey: ["machines"] }); // Machines table list
      queryClient.invalidateQueries({ queryKey: ["select-agent"] }); // Assigned Agents List (on Machine table)
      queryClient.invalidateQueries({ queryKey: ["jobs"] }); // Jobs list
      queryClient.invalidateQueries({ queryKey: ["agents-assist"] }); // Assist Agents list
    };

    // Subscribe to the machine status update event
    connection.on("machine_status_update", handleMachineStatusUpdate);

    // Cleanup listener on component unmount or connection change
    return () => {
      connection.off("machine_status_update", handleMachineStatusUpdate);
    };
  }, [connection, queryClient]);
}
