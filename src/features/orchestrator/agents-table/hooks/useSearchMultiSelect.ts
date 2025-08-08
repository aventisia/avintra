import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { AssignMachineDto } from "../dtos/assign-machine-dto";
import { useAssignMachineStore } from "../stores/assign-machine-store";

import { useAssignMachineMutation } from "./useAssignMachineMutation";
import { useDebounce } from "./useDebounce";
import { useSearchMachinesList } from "./useSearchMachinesList";

export const useSearchMultiSelect = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<AssignMachineDto[]>([]);
  const [selectedValue, setSelectedValue] = useState("View");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { flowVersionId, machineIds } = useAssignMachineStore(
    useShallow((s) => ({
      flowVersionId: s.flowVersionId,
      machineIds: s.machineIds,
    })),
  );

  const {
    data: searchData,
    isLoading,
    isError,
  } = useSearchMachinesList(debouncedSearchTerm);

  const { mutate, isPending } = useAssignMachineMutation();

  const handleItemSelect = (item: AssignMachineDto) => {
    if (!selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const handleItemRemove = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => setSelectedItems([]);

  const handleSubmit = async () => {
    try {
      const mergedUniqueIds = Array.from(
        new Set([...machineIds, ...selectedItems.map((v) => v.id)]),
      );

      mutate({
        flowVersionId,
        machineIds: mergedUniqueIds,
      });
    } finally {
      handleClearAll();
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
    handleSubmit,
    searchData,
    isLoading,
    isError,
    isPending,
  };
};
