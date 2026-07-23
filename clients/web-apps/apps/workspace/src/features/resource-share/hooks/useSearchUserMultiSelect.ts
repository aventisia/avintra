import { useDebounce } from "@avplatform/ui/hooks/useDebounce";
import { useState } from "react";

import { ResourceShareRecipientDto } from "../dtos/resource-share-dto";
import { WorkspaceUserDto } from "../dtos/workspace-user-dto";
import { useResourceShareStore } from "../stores/resource-share-store";
import { useInsertResourceShareMutation } from "./useInsertResourceShareMutation";
import { useSearchUsersList } from "./useSearchUsersList";

export const useSearchUserMultiSelect = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<WorkspaceUserDto[]>([]);
  const [accessType, setAccessType] = useState("View");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { isTenantWideAccess, resourceId, resourceType } = useResourceShareStore((state) => ({
    resourceId: state.resourceId,
    resourceType: state.resourceType,
    isTenantWideAccess: state.isTenantWideAccess,
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

  const { mutateAsync: insertSharedResources } = useInsertResourceShareMutation();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const users = selectedItems.map((v) => {
        return { userId: v.id, accessLevel: accessType };
      }) as ResourceShareRecipientDto[];

      if (!users.length || !resourceId || !resourceType) return;
      await insertSharedResources({ resourceId, resourceType, users });
    } finally {
      // all users are assigned
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
    accessType,
    setAccessType,
    resourceId,
    resourceType,
    isTenantWideAccess,
  };
};
