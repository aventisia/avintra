import { HubConnection } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Listens for machine status updates over a WebSocket connection
 * and invalidates dependent React Query caches so the UI reflects the latest state.
 *
 * @param connection - The SignalR HubConnection instance.
 */
export default function useCheckMachineStatus(connection: HubConnection | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!connection) return;

    const handleMachineStatusUpdate = () => {
      // Machine online/offline changes affect:
      // - the machines table, assign-machine selectors, and agent-machine lists
      // - jobs and assist-agent lists because execution eligibility depends on machine status
      queryClient.invalidateQueries({ queryKey: ["machines-to-select"] });
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      queryClient.invalidateQueries({ queryKey: ["select-agent"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["agents-assist"] });
    };

    connection.on("machine_status_update", handleMachineStatusUpdate);

    return () => {
      connection.off("machine_status_update", handleMachineStatusUpdate);
    };
  }, [connection, queryClient]);
}
