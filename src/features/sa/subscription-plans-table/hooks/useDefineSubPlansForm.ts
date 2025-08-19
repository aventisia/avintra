import { useCheckAvailability } from "@aventisia/ui/hooks";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { isSubPlanNameAvailable } from "../apis/sub-plans-table-apis";
import { PLANS_QUERY_KEY } from "../constants";
import {
  subPlanNameSchema,
  subPlansZodSchema,
} from "../constants/sub-plans-zod-schema";
import { SubPlansTableDto } from "../dtos/sub-plans-table-dto";

/**
 * Custom hook for defining a Subscription Plans form.
 */
export const useDefineSubPlansForm = () => {
  // Set subPlan name state (required for avaialbility check)
  const [subPlanName, setSubPlanName] = useState("");

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
  const form = useForm<z.infer<typeof subPlansZodSchema>>({
    resolver: zodResolver(subPlansZodSchema),
    defaultValues: {
      id: "",
      name: "",
      maxCredits: 0,
      maxPublishedItems: 0,
      historyRetentionDays: 0,
      maxUsers: 0,
      maxSpaces: 0,
      storageLimitMB: 0,
      isDisabled: false,
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

  // Fetch subPlan data when rowId changes
  useEffect(() => {
    // Get subPlans data from query client
    const subPlansData = queryClient.getQueryData<{
      data: SubPlansTableDto[];
    }>(PLANS_QUERY_KEY);

    // Get subPlan data by id
    const subPlanData = subPlansData?.data.find((item) => item.id === rowId);

    // Set subPlan name
    setSubPlanName(subPlanData?.name ?? "");

    // Set subPlan data to form
    form.reset({
      id: rowId,
      name: subPlanData?.name ?? "",
      maxCredits: subPlanData?.maxCredits ?? 0,
      maxPublishedItems: subPlanData?.maxPublishedItems ?? 0,
      maxUsers: subPlanData?.maxUsers ?? 0,
      historyRetentionDays: subPlanData?.historyRetentionDays ?? 0,
      storageLimitMB: subPlanData?.storageLimitMB ?? 0,
      maxSpaces: subPlanData?.maxSpaces ?? 0,
      isDisabled: subPlanData?.isDisabled ?? false,
      // Read (view) only fields
      createdBy:
        subPlanData?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,
      createdOn: subPlanData?.createdOn
        ? new Date(subPlanData?.createdOn)
        : new Date(),
      lastModifiedBy:
        subPlanData?.lastModifiedBy ??
        userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: subPlanData?.lastModifiedOn
        ? new Date(subPlanData?.lastModifiedOn)
        : new Date(),
    });

    // Focus the name field after reset.
    setTimeout(() => {
      form.setFocus("name", { shouldSelect: false });
    }, 0);
  }, [rowId, form, queryClient, userSession]);

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof subPlansZodSchema>, z.ZodString>({
    defaultInputValue: subPlanName,
    fieldName: "name",
    form,
    fieldSchema: subPlanNameSchema,
    checkAvailabilityAPIFn: isSubPlanNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof subPlansZodSchema>) => {
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
    isCheckPending,
    handleInputChange,
  };
};
