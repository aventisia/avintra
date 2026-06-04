/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useResourceShareStore } from "../stores/resource-share-store";

interface UseTenantAccessProps {
  queryKey: unknown[];
  updateApiFn: (updatedDto: any) => Promise<any>;
}

/**
 * Manages the state and API mutation for tenant-wide resource access.
 * Synchronizes local draft state with the backend truth and handles
 * React Query cache updates optimistically.
 */
export const useResourceShareTenantAccess = ({
  queryKey,
  updateApiFn,
}: UseTenantAccessProps) => {
  const queryClient = useQueryClient();

  const {
    showDialog,
    isTenantWideAccess: initialAccessState,
    resourceId,
  } = useResourceShareStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
      isTenantWideAccess: state.isTenantWideAccess,
      resourceId: state.resourceId,
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
    mutationFn: updateApiFn,
    onSuccess: (res) => {
      if (res?.message) toast.success(res?.message);
      queryClient.invalidateQueries({ queryKey });
    },
  });

  /**
   * Retrieves the active resource from the React Query cache,
   * merges the draft tenant access state, and executes the mutation.
   */
  const handleCommitTenantAccess = async () => {
    if (!resourceId) {
      console.error("No active resource selected for sharing");
      return;
    }

    const cacheData = queryClient.getQueryData<any>(queryKey);

    // Fallback to empty array to handle variations in API response wrappers
    const items = Array.isArray(cacheData) ? cacheData : cacheData?.data || [];
    const activeRowDto = items.find((row: any) => row.id === resourceId);

    if (!activeRowDto) {
      console.error(`Row with ID ${resourceId} not found in cache.`);
      return;
    }

    const finalDto = {
      ...activeRowDto,
      isTenantWideAccess: assignAllDraft,
    };

    try {
      await updateMutation.mutateAsync(finalDto);
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
