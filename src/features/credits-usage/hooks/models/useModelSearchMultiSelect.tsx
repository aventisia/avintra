import { useState } from "react";

import { AgentModelDTO } from "../../dtos/agents-models-dto";
import { useExportDialogStore } from "../../store/export-dialog-store";
import { useDebounce } from "../useDebounce";

import { useSearchModelsList } from "./useSearchModelsList";

export const useModelSearchMultiSelect = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<AgentModelDTO[]>([]);
  const [selectedValue, setSelectedValue] = useState("View");
  const { toggleFormDirty } = useExportDialogStore();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data: searchData,
    isLoading,
    isError,
  } = useSearchModelsList(debouncedSearchTerm);

  const handleItemSelect = (item: AgentModelDTO) => {
    toggleFormDirty(true);
    if (!selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const handleItemRemove = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => setSelectedItems([]);

  return {
    searchTerm,
    setSearchTerm,
    selectedItems,
    handleItemSelect,
    handleItemRemove,
    handleClearAll,
    selectedValue,
    setSelectedValue,
    searchData,
    isLoading,
    isError,
  };
};
