import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { WorkspaceUserDto } from "../dtos/workspace-user-dto";
import { usePublishedUiStore } from "../stores/published-ui-store";
import { useAssignPublishedUiUser } from "./useAssignPublishedUiUser.hook";
import { useDebounce } from "./useDebounce";
import { useSearchPublishedUiUserList } from "./useSearchPublishedUiUserList.hook";

/**
 * Drives the user multi-select inside the published UI builder project assignment dialog.
 */
export const useSearchPublishedUiUserMultiSelect = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<WorkspaceUserDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { uiBuilderProjectId } = usePublishedUiStore(
    useShallow((state) => ({
      uiBuilderProjectId: state.uiBuilderProjectId,
    })),
  );

  const {
    data: searchData,
    isLoading,
    isError,
  } = useSearchPublishedUiUserList(debouncedSearchTerm);

  const handleItemSelect = (item: WorkspaceUserDto) => {
    if (!selectedItems.some((existing) => existing.id === item.id)) {
      setSelectedItems((previous) => [...previous, item]);
    }
  };

  const handleItemRemove = (id: string) => {
    setSelectedItems((previous) => previous.filter((item) => item.id !== id));
  };

  const handleClearAll = () => setSelectedItems([]);

  const { mutateAsync: assignUsers } = useAssignPublishedUiUser();

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
    uiBuilderProjectId,
  };
};
