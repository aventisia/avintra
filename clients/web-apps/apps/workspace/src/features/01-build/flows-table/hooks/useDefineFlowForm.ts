import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { isFlowNameAvailable } from "../apis/flows-table-apis";
import { flowNameSchema, flowZodSchema } from "../constants/flow-zod-schema";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { useTableTab } from "./useTableTab";

interface UseDefineFlowFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a flow form.
 */
export const useDefineFlowForm = ({ rowId, crudAction }: UseDefineFlowFormOptions) => {
  // Set flow name state (required for avaialbility check)
  const [flowName, setFlowName] = useState("");

  const { setIsDirty } = useCrudDialogDirty();

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof flowZodSchema>>({
    resolver: zodResolver(flowZodSchema),
    defaultValues: {
      id: "",
      type: "Agent", // TODO: Remove later when we are sure whether we need this field or not
      name: "",
      description: "",
      thumbnail: "",
      isDisabled: false,
      flowCommentCount: 0,
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: new Date(),
    },
  });

  // Use this in place FLOWS_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch flow data when rowId changes
  useEffect(() => {
    // Get flows data from query client
    const flowsData = queryClient.getQueryData<{
      data: FlowsTableDto[];
    }>(queryKey);

    // Get flow data by id
    const flowData = flowsData?.data.find((item) => item.id === rowId);

    // Set flow name
    setFlowName(flowData?.name ?? "");

    // Set flow data to form
    form.reset({
      id: rowId,
      type: flowData?.type ?? "Agent",
      name: flowData?.name ?? "",
      description: flowData?.description ?? "",
      thumbnail: flowData?.thumbnail ?? "",
      isDisabled: flowData?.isDisabled ?? false,
      // Read (view) only fields
      flowCommentCount: flowData?.flowCommentCount ?? 0,
      createdBy: flowData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: flowData?.createdOn ? new Date(flowData?.createdOn) : new Date(),
      lastModifiedBy:
        flowData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: flowData?.lastModifiedOn ? new Date(flowData?.lastModifiedOn) : new Date(),
    });

    // Focus the name field after reset.
    setTimeout(() => {
      form.setFocus("name", { shouldSelect: false });
    }, 0);
  }, [rowId, form, queryClient, userSession, queryKey]);

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof flowZodSchema>, z.ZodString>({
    defaultInputValue: flowName,
    fieldName: "name",
    form,
    fieldSchema: flowNameSchema,
    checkAvailabilityAPIFn: isFlowNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof flowZodSchema>) => {
    return {
      ...formData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  // Save the form dirty state
  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Reset availability message when dialog closes
  useEffect(() => {
    return () => {
      setAvailabilityMessage(null);
    };
  }, [setAvailabilityMessage]);

  // Return form and methods
  return {
    form,
    isDirty,
    crudAction,
    refineFormData,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
