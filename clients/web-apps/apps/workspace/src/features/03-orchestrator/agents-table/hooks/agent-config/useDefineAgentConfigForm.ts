import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { DATA_QUERY_KEY } from "../../constants";
import { agentConfigZodSchema } from "../../constants/agent-config-zod-schema";
import { AgentsTableDto } from "../../dtos/agents-table-dto";
import { useAgentConfigStore } from "../../stores/agent-config-store";

export const useDefineAgentConfigForm = () => {
  const { flowVersionId, setShowDialog } = useAgentConfigStore(
    useShallow((state) => ({
      flowVersionId: state.flowVersionId,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  const form = useForm<z.infer<typeof agentConfigZodSchema>>({
    resolver: zodResolver(agentConfigZodSchema),
    defaultValues: {
      maxExecutionTimeInMinutes: 60,
    },
  });

  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // Fetch agent data when rowId changes
  useEffect(() => {
    // Get agents data from query client
    const agentsData = queryClient.getQueryData<{
      data: AgentsTableDto[];
    }>(DATA_QUERY_KEY);

    // Get agent data by id
    const agentData = agentsData?.data.find((item) => item.id === flowVersionId);
    if (agentData?.settings) {
      // Set agent data to form
      form.reset({
        maxExecutionTimeInMinutes: agentData.settings.maxExecutionTimeInMinutes,
      });
    }
  }, [flowVersionId, form, queryClient]);

  // Return form and methods
  return {
    form,
    isSubmitting,
    isDirty,
    flowVersionId,
    setShowDialog,
  };
};
