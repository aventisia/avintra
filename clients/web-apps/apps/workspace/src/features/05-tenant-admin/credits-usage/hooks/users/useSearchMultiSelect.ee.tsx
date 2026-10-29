import { useState } from "react";

import { WorkspaceUserDto } from "../../dtos/workspace-user-dto.ee";
import { useExportDialogStore } from "../../store/export-dialog-store.ee";
import { useDebounce } from "../useDebounce.ee";
import { useSearchUserList } from "./useSearchUserList.ee";

export const useSearchMultiSelect = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<WorkspaceUserDto[]>([]);
  const [selectedValue, setSelectedValue] = useState("View");
  const { toggleFormDirty } = useExportDialogStore();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: searchData, isLoading, isError } = useSearchUserList(debouncedSearchTerm);

  const handleItemSelect = (item: WorkspaceUserDto) => {
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
