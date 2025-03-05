import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { getAssignableAgents } from "../apis/machine-apis";
import { useMachineAgentStore } from "../store/machine-agent-store";
import { useShallow } from "zustand/react/shallow";

/**
 * Custom hook to fetch assignable agent to the machine using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchAgents = () => {

    //get the selected machine id
    const { machineId } = useMachineAgentStore(useShallow((state) => ({ machineId: state.machineId })))

    // Get agents using react query
    const { data, isFetching, isLoading, isError, error } = useQuery({
        queryKey: ["agents-to-select"],
        queryFn: () => getAssignableAgents(machineId),
    });

    // Show toast on fetch error
    useEffect(() => {
        if (isError) toast.error(error.toString());
    }, [error, isError]);

    // Return isFetching and isLoading flag
    return { data, isFetching, isLoading };
};
