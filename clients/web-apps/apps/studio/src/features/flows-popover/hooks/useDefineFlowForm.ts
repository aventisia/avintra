import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { isFlowNameAvailable } from "../apis/flows-table-apis";
import { FLOWS_QUERY_KEY } from "../constants/constants";
import { flowNameSchema, flowZodSchema } from "../constants/flow-zod-schema";
import { FlowsTableDto } from "../dtos/flows-table-dto";

/* Note: Its a copy of flows-table feature of workspace app. 
  Any change to the this file is going to affect both the files/features. 
  So, we just need to replace the file's content in future.
*/

/**
 * Custom hook for defining a flow form.
 */
export const useDefineFlowForm = () => {
  // Set flow name state (required for avaialbility check)
  const [flowName, setFlowName] = useState("");

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get data-table crud dialog store state and actions
  const {
    crudDialogOptions: { showDialog, rowId, crudAction },
    toggleFormDirty,
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
      toggleFormDirty: state.toggleFormDirty,
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
      type: "",
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

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch flow data when rowId changes
  useEffect(() => {
    // Get flows data from query client
    const flowsData = queryClient.getQueryData<{
      data: FlowsTableDto[];
    }>(FLOWS_QUERY_KEY);

    // Get flow data by id
    const flowData = flowsData?.data.find((item) => item.id === rowId);

    // Set flow name
    setFlowName(flowData?.name ?? "");

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
      createdBy: flowData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: flowData?.createdOn ? new Date(flowData?.createdOn) : new Date(),
      lastModifiedBy:
        flowData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: flowData?.lastModifiedOn ? new Date(flowData?.lastModifiedOn) : new Date(),
    });
  }, [rowId, form, queryClient, userSession]);

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
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  // Reset availability message when dialog closes
  useEffect(() => {
    if (!showDialog) setAvailabilityMessage(null);
  }, [setAvailabilityMessage, showDialog]);

  // Return form and methods
  return {
    form,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
