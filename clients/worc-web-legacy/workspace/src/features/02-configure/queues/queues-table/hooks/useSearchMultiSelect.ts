import { AgentsTableDto } from "@/features/03-orchestrator/agents-table/dtos/agents-table-dto";
import { useDebounce } from "@/features/03-orchestrator/agents-table/hooks/useDebounce";

import { useState } from "react";

import { useQueueAgentsStore } from "../stores/queue-agents-store";
import { useAssignAgentMutation } from "./useAssignAgentMutation";
import { useSearchAgentsList } from "./useSearchAgentsList";

export const useSearchMultiSelect = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<AgentsTableDto[]>([]);
  const [selectedValue, setSelectedValue] = useState("View");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { setView, queueId } = useQueueAgentsStore((state) => ({
    setView: state.setView,
    queueId: state.queueId,
  }));

  const {
    data: searchData,
    isLoading,
    isError,
  } = useSearchAgentsList(debouncedSearchTerm);

  const handleItemSelect = (item: AgentsTableDto) => {
    if (!selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const handleItemRemove = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => setSelectedItems([]);

  const { mutateAsync: assignAgents } = useAssignAgentMutation();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const agentIds = selectedItems.map((v) => v.id);

      if (!agentIds.length) return;

      await Promise.all(
        agentIds.map((id) =>
          assignAgents({
            flowVersionId: id,
            queueId,
            accessType: selectedValue,
          }),
        ),
      );
    } finally {
      // all agents are assigned
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
