import { useState } from "react";

import { WorkspaceUserDto } from "../../dtos/workspace-user-dto";
import { useAgentUsersStore } from "../../stores/agent-users-store";
import { useDebounce } from "../useDebounce";
import { useAssignUserMutation } from "./useAssignUserMutation";
import { useSearchUsersList } from "./useSearchUsersList";

export const useSearchUserMultiSelect = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<WorkspaceUserDto[]>([]);
  const [selectedValue, setSelectedValue] = useState("View");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { setView, flowVersionId } = useAgentUsersStore((state) => ({
    setView: state.setView,
    flowVersionId: state.flowVersionId,
  }));

  const { data: searchData, isLoading, isError } = useSearchUsersList(debouncedSearchTerm);

  const handleItemSelect = (item: WorkspaceUserDto) => {
    if (!selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const handleItemRemove = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => setSelectedItems([]);

  const { mutateAsync: assignUsers } = useAssignUserMutation();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const userIds = selectedItems.map((v) => v.id);

      if (!userIds.length) return;

      await Promise.all(
        userIds.map((id) =>
          assignUsers({
            userId: id,
            flowVersionId: flowVersionId,
          }),
        ),
      );
    } finally {
      // all users are assigned
      handleClearAll();
      setView("Users");
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
    flowVersionId,
  };
};
