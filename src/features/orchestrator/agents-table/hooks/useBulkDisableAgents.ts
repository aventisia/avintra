import { toast } from "@aventisia/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";

import { disableMachines } from "../apis/agents-table-apis";
import { DATA_QUERY_KEY } from "../constants";

const useBulkDisableAgents = () => {
  const queryClient = useQueryClient();

  const disableAgents = async (selectedAgentIds: string[]) => {
    if (!selectedAgentIds.length) return;

    try {
      await disableMachines(selectedAgentIds);
      toast.success("Selected agents have been disabled.");
    } catch (error) {
      console.error("Failed to disable agents", error);
      toast.error("Failed to disable selected agents.");
    } finally {
      await queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
    }
  };

  return { disableAgents };
};

export default useBulkDisableAgents;
