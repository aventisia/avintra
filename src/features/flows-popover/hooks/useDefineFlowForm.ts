import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { flowZodSchema } from "../constants/flow-zod-schema";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { useFlowsPopoverStore } from "../stores/flows-popover-store";

/**
 * Custom hook for defining a flow form.
 *
 * @returns An object containing the form, form methods, and other related values.
 */
export const useDefineFlowForm = () => {
  // 1. Get flows store state and actions
  const { projectId, flowsQueryKey } = useFlowsPopoverStore(
    useShallow((state) => ({
      projectId: state.projectId,
      flowsQueryKey: state.flowsQueryKey,
    })),
  );

  // 2. Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // 3. Get store state and actions
  const {
    crudDialogOptions: { rowId, crudAction },
    toggleFormDirty,
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  // 4. Get query client
  const queryClient = useQueryClient();

  // 5. Define form with zod schema
  const form = useForm<z.infer<typeof flowZodSchema>>({
    resolver: zodResolver(flowZodSchema),
  });

  // 6. Desctructure form's methods
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // 7. Fetch flow data when rowId changes
  useEffect(() => {
    // Get flows data from query client
    const flowsData = queryClient.getQueryData<{
      data: FlowsTableDto[];
    }>(flowsQueryKey);

    // Get flow data by id
    const flowData = flowsData?.data.find((item) => item.id === rowId);

    // Set flow data to form
    form.reset({
      id: rowId,
      type: flowData?.type ?? "",
      name: flowData?.name ?? "",
      description: flowData?.description ?? "",
      thumbnail: flowData?.thumbnail ?? "",
      isDisabled: flowData?.isDisabled ?? false,
      // Read (view) only fields
      flowCommentCount: flowData?.flowCommentCount ?? 0,
      projectId: projectId,
      createdBy: flowData?.createdBy ?? userSession?.email,
      createdOn: flowData?.createdOn
        ? new Date(flowData?.createdOn)
        : new Date(),
      lastModifiedBy: flowData?.lastModifiedBy ?? userSession?.email,
      lastModifiedOn: flowData?.lastModifiedOn
        ? new Date(flowData?.lastModifiedOn)
        : new Date(),
    });
  }, [rowId, projectId, form, queryClient, flowsQueryKey, userSession]);

  // 8. Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof flowZodSchema>) => {
    return {
      ...formData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  // Return form and methods
  return {
    form,
    isSubmitting,
    isDirty,
    flowsQueryKey,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  };
};
