import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { AgentsTableDto } from "../../agents-table/dtos/agents-table-dto";
import { useDebounce } from "../../agents-table/hooks/useDebounce";
import { DATA_QUERY_KEY } from "../constants";
import { MachinesTableDto } from "../dtos/machines-table-dto";
import { SelectAgentTableDto } from "../dtos/select-agent-table-dto";
import { useAssignAgentsStore } from "../stores/assign-agents-store";

import { useSearchAgentsList } from "./useSearchAgentsList";
import { useUpdateMachineAgentsMutation } from "./useUpdateMachineAgentsMutation";

export const useSearchMultiSelect = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<AgentsTableDto[]>([]);
  const [selectedValue, setSelectedValue] = useState("View");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { setView, machineId } = useAssignAgentsStore((state) => ({
    setView: state.setView,
    machineId: state.machineId,
  }));

  const queryClient = useQueryClient();

  const {
    data: searchData,
    isLoading,
    isError,
  } = useSearchAgentsList(debouncedSearchTerm);

  const { mutate: updateAgents } = useUpdateMachineAgentsMutation();

  const handleItemSelect = (item: AgentsTableDto) => {
    if (!selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const handleItemRemove = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => setSelectedItems([]);

  const machinesData = queryClient.getQueryData<{
    data: MachinesTableDto[];
  }>(DATA_QUERY_KEY);

  const machineData = machinesData?.data?.find((v) => v.id == machineId);

  const agentsData = queryClient.getQueryData<{
    data: SelectAgentTableDto[];
  }>(["select-agent", machineId]);

  const agentIds =
    agentsData?.data.filter((item) => item.isAssigned).map((v) => v.id) ?? [];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const mergedUniqueIds = Array.from(
        new Set([...agentIds, ...selectedItems.map((v) => v.id)]),
      );

      if (machineData) {
        updateAgents({ ...machineData, agentIds: mergedUniqueIds });
      }
    } finally {
      handleClearAll();
      setView("Agents");
      setIsSubmitting(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedItems,
    handleItemSelect,
    handleItemRemove,
    handleClearAll,
    selectedValue,
    setSelectedValue,
    isSubmitting,
    handleSubmit,
    searchData,
    isLoading,
    isError,
  };
};
