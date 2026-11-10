import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { getUserDisplayName } from "@avplatform/ui/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMatch } from "react-router-dom";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { getMergedQueryData } from "@/utils/get-merged-query-data.util";

import { isFlowNameAvailable } from "../apis/flows-table-apis";
import { FLOWS_QUERY_KEY, FOLDER_PAGE_PATH_PATTERN } from "../constants";
import { flowNameSchema, flowZodSchema } from "../constants/flow-zod-schema";
import { FlowsTableDto } from "../dtos/flows-table-dto";

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

  // IMPORTANT NOTE: The crud dialog is mounted above the routed page, so the folder page's route param is only reachable through the route match.
  const folderPageMatch = useMatch(FOLDER_PAGE_PATH_PATTERN);
  const folderId = folderPageMatch?.params.folderId;

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
      createdBy: getUserDisplayName(userSession),
      createdOn: new Date(),
      lastModifiedBy: getUserDisplayName(userSession),
      lastModifiedOn: new Date(),
    },
  });

  const queryKey = FLOWS_QUERY_KEY;

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch flow data when rowId changes
  useEffect(() => {
    // Get flows data from the merged Personal/Shared lists in the cache
    const flowsData = getMergedQueryData<FlowsTableDto>(queryClient, queryKey);

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
      createdBy: flowData?.createdBy ?? getUserDisplayName(userSession),
      createdOn: flowData?.createdOn ? new Date(flowData?.createdOn) : new Date(),
      lastModifiedBy: flowData?.lastModifiedBy ?? getUserDisplayName(userSession),
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
    // Flow type is frozen after creation: always send the stored original on update
    // so a tampered/enabled select cannot change it.
    let type = formData.type;
    let currentFolderId: string | null | undefined = folderId;
    if (crudAction === "update") {
      const flowsData = getMergedQueryData<FlowsTableDto>(queryClient, queryKey);
      const originalFlow = flowsData?.data.find((item) => item.id === rowId);
      if (originalFlow?.type) type = originalFlow.type;
      currentFolderId = originalFlow?.folderId;
    }

    return {
      ...formData,
      type,
      ...(currentFolderId && { folderId: currentFolderId }),
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
    folderId,
    refineFormData,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
