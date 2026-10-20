import { useState } from "react";

import { WorkspaceUserDto } from "@/features/03-orchestrator/agents-table/dtos/workspace-user-dto";
import { useDebounce } from "@/features/03-orchestrator/agents-table/hooks/useDebounce";

import { useAssignUiBuilderUserMutation } from "./useAssignUiBuilderUserMutation";
import { useSearchUiBuilderUserList } from "./useSearchUiBuilderUserList";

/**
 * Drives the user multi-select inside the UI builder project assignment dialog.
 */
export const useSearchUiBuilderUserMultiSelect = (uiBuilderProjectId: string) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<WorkspaceUserDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: searchData, isLoading, isError } = useSearchUiBuilderUserList(debouncedSearchTerm);

  const handleItemSelect = (item: WorkspaceUserDto) => {
    if (!selectedItems.some((existing) => existing.id === item.id)) {
      setSelectedItems((previous) => [...previous, item]);
    }
  };

  const handleItemRemove = (id: string) => {
    setSelectedItems((previous) => previous.filter((item) => item.id !== id));
  };

  const handleClearAll = () => setSelectedItems([]);

  const { mutateAsync: assignUsers } = useAssignUiBuilderUserMutation(uiBuilderProjectId);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const userIds = selectedItems.map((item) => item.id);

      if (!userIds.length) return;

      await Promise.all(
        userIds.map((userId) =>
          assignUsers({
            userId,
            uiBuilderProjectId,
          }),
        ),
      );
    } finally {
      handleClearAll();
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
    isSubmitting,
    handleSubmit,
    searchData,
    isLoading,
    isError,
  };
};
