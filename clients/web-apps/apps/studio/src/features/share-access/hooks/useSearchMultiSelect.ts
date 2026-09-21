import { toast } from "@avplatform/ui/sonner";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { UserType } from "../dtos/flow-user-dto";
import { WorkspaceUserDto } from "../dtos/workspace-user-dto";
import { useShareStore } from "../stores/share-store";
import { useDebounce } from "./useDebounce";
import { useInsertUserMutation } from "./useInsertUserMutation";
import { useSearchUserList } from "./useSearchUserList";

export const useSearchMultiSelect = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<WorkspaceUserDto[]>([]);
  const [selectedValue, setSelectedValue] = useState("View");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );
  const { setView } = useShareStore(useShallow((state) => ({ setView: state.setView })));

  const { data: searchData, isLoading, isError } = useSearchUserList(debouncedSearchTerm);

  const { mutateAsync } = useInsertUserMutation();

  const handleItemSelect = (item: WorkspaceUserDto) => {
    if (!selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const handleItemRemove = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => setSelectedItems([]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const results = await Promise.all(
        selectedItems.map((user) =>
          mutateAsync({
            userId: user.id,
            type: selectedValue as UserType,
            flowId: currentFlow.id,
          }).catch((err) => {
            console.error("Insert failed", user, err);
            return null;
          }),
        ),
      );

      const successCount = results.filter(Boolean).length;
      if (successCount > 0) {
        toast.success(`${successCount} Users added successfully`, {
          className: "sonner-toaster-sm",
        });
      }
    } finally {
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
  };
};
