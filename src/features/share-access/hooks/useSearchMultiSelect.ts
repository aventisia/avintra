import { useState } from "react";
import { WorkspaceUserDto } from "../dtos/workspace-user-dto";
import { useDebounce } from "./useDebounce";
import { useShareStore } from "../stores/share-store";
import { useSearchUserList } from "./useSearchUserList";
import { useInsertUserMutation } from "./useInsertUserMutation";
import { UserType } from "../dtos/flow-user-dto";
import { toast } from "@aventisia/ui/sonner";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

export const useSearchMultiSelect = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<WorkspaceUserDto[]>([]);
  const [selectedValue, setSelectedValue] = useState("View");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {modelId} = useLabelDataStore(); 
  const { setView } = useShareStore((state) => ({ setView: state.setView }));

  const {
    data: searchData,
    isLoading,
    isError,
  } = useSearchUserList(debouncedSearchTerm);

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
            accessType: selectedValue as UserType,
            mlModelId: modelId,
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
