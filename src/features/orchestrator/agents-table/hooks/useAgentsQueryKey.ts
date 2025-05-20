import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useMachinesSelectTableStore } from "../stores/machines-select-table-store";

/**
 * Custom hook to set the query key for agents.
 * @returns void
 */
export const useAgentsQueryKey = () => {
  // Get machineId (p) and machineName (pn)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const machineId = queryParams.get("m");

  // Get store setAgentsState action
  const { setAgentsState } = useMachinesSelectTableStore(
    useShallow((state) => ({
      setAgentsState: state.setAgentsState,
    })),
  );

  // Set agents query key, machine id, and machine name
  useEffect(() => {
    setAgentsState(machineId ?? "");
  }, [machineId, setAgentsState]);
};
