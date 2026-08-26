import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { DATA_QUERY_KEY } from "../../constants";
import { AgentsTableDto } from "../../dtos/agents-table-dto";
import { useUpdateAgentMutation } from "../../hooks/useUpdateAgentMutation";

interface DTEditRowActionProps {
  rowId: string;
  size?: "sm" | "md";
}

export const EnableAgentRowAction: React.FC<DTEditRowActionProps> = ({ rowId, size = "md" }) => {
  const queryClient = useQueryClient();

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // The agents data is cached under a space-scoped key (see useFetchAgents)
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );
  const agentsData = queryClient.getQueryData<{
    data: AgentsTableDto[];
  }>([...DATA_QUERY_KEY, currentSpace?.id]);

  // Get agent data by id
  const agentData = agentsData?.data.find((item) => item.id === rowId);

  // Define mutation using React Query
  const { mutate } = useUpdateAgentMutation();

  const handleEnable = () => {
    if (agentData)
      mutate({
        ...agentData,
        lastModifiedBy: userSession?.email ?? "",
        lastModifiedOn: new Date(),
        isDisabled: false,
      });
  };
  // Return the Edit or View dropdown menu item
  return (
    <SimpleDDMenuItem
      size={size}
      content="Enable"
      Icon={CheckCircle}
      onClick={() => {
        handleEnable();
      }}
    />
  );
};
