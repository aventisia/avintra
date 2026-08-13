import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { updateTenantWideAccess } from "../apis/resource-share-apis";
import { TenantAccessResourceShareDto } from "../dtos/resource-share-dto";
import { ResourceTypeEnum } from "../enums/resource-type-enum";
import { useResourceShareStore } from "../stores/resource-share-store";

interface UseTenantAccessProps {
  queryKey: unknown[];
}

/**
 * Manages the state and API mutation for tenant-wide resource access.
 * Synchronizes local draft state with the backend truth and handles
 * React Query cache updates optimistically.
 */
export const useResourceShareTenantAccess = ({ queryKey }: UseTenantAccessProps) => {
  const queryClient = useQueryClient();

  const {
    showDialog,
    isTenantWideAccess: initialAccessState,
    resourceId,
    resourceType,
  } = useResourceShareStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
      isTenantWideAccess: state.isTenantWideAccess,
      resourceId: state.resourceId,
      resourceType: state.resourceType,
    })),
  );

  // Represents the unsaved UI state driven by the checkbox
  const [assignAllDraft, setAssignAllDraft] = useState(false);

  // Represents the confirmed backend state, used to conditionally render specific users
  const [assignAllSaved, setAssignAllSaved] = useState(false);

  useEffect(() => {
    if (showDialog) {
      setAssignAllDraft(initialAccessState);
      setAssignAllSaved(initialAccessState);
    }
  }, [initialAccessState, showDialog]);

  const updateMutation = useMutation({
    mutationFn: updateTenantWideAccess,
    onSuccess: (res) => {
      if (res?.message) toast.success(res?.message);
      queryClient.invalidateQueries({ queryKey });
    },
  });

  /**
   * Executes the tenant-wide access mutation for the active resource.
   */
  const handleCommitTenantAccess = async () => {
    if (!resourceId) {
      console.error("No active resource selected for sharing");
      return;
    }

    const tenantAccessDto: TenantAccessResourceShareDto = {
      resourceId,
      resourceType: resourceType as ResourceTypeEnum,
      isTenantWideAccess: assignAllDraft,
    };

    try {
      await updateMutation.mutateAsync(tenantAccessDto);
      setAssignAllSaved(assignAllDraft);
    } catch (error) {
      console.error("Failed to update tenant access:", error);
    }
  };

  return {
    assignAllDraft,
    setAssignAllDraft,
    assignAllSaved,
    isMutating: updateMutation.isPending,
    handleCommitTenantAccess,
  };
};
