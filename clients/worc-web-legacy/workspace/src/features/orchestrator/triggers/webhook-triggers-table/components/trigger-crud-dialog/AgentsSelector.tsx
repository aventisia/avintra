/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDebounce } from "@/react-toolkit/hooks/useDebounce";

import { CrudActionType } from "@aventisia/ui/types";
import { useEffect, useState } from "react";

import { SearchAgentsDto } from "../../dtos/search-agent-dto";
import { useFetchAgentList } from "../../hooks/useFetchAgentList";
import { useFetchTriggerAgents } from "../../hooks/useFetchTriggerAgents";
import { MultiSelector } from "./MultiSelector";

interface AgentsSelectorProps {
  value?: (any[] | undefined)[]; // Array of strings for the selected agent IDs
  onChange: (value: (any | undefined)[]) => void; // Function to updates the value (array of strings)
  id?: string;
  crudAction: CrudActionType;
}

export const AgentsSelector = ({
  onChange,
  id = "",
  crudAction,
}: AgentsSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<SearchAgentsDto[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    //check crudAction to avoid form dirty in view mode
    if (selectedItems.length && crudAction !== "read")
      onChange(
        selectedItems.map((item) => {
          return {
            id: item.id,
            name: item.name,
            versionNumber: item.versionNumber,
          };
        }),
      );
  }, [crudAction, onChange, selectedItems]);

  const {
    data: searchData,
    isLoading,
    isError,
  } = useFetchAgentList(debouncedSearchTerm);

  const { data: triggerAgents } = useFetchTriggerAgents(
    crudAction == "create" ? "" : id,
  );

  useEffect(() => {
    if (triggerAgents) {
      setSelectedItems(triggerAgents.data);
    }
  }, [triggerAgents]);

  const handleItemSelect = (item: SearchAgentsDto) => {
    if (!selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems([item]);
    }
  };

  const handleItemRemove = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <MultiSelector
      searchResults={searchData?.data || []}
      selectedItems={selectedItems}
      onItemSelect={handleItemSelect}
      onItemRemove={handleItemRemove}
      onSearchChange={setSearchTerm}
      searchQuery={searchTerm}
      isLoading={isLoading}
      isError={isError}
      placeholder="Search for agent..."
      maxHeight="300px"
    />
  );
};
