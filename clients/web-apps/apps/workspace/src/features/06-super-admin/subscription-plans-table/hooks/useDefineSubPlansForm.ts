import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { PLANS_QUERY_KEY } from "../constants";
import { subPlansZodSchema } from "../constants/sub-plans-zod-schema";
import { SubPlansTableDto } from "../dtos/sub-plans-table-dto";

/**
 * Custom hook for defining a Subscription Plans form.
 */
export const useDefineSubPlansForm = () => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get data-table crud dialog store state and actions
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

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof subPlansZodSchema>>({
    resolver: zodResolver(subPlansZodSchema),
    defaultValues: {
      id: "",
      name: "",
      type: "Starter",
      currency: "USD",
      frequency: "Monthly",
      status: "Current",
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

    // Set subPlan data to form
    form.reset({
      id: rowId,
      name: subPlanData?.name ?? "",
      maxCredits: subPlanData?.maxCredits,
      type: subPlanData?.type ?? "Pro",
      maxPublishedItems: subPlanData?.maxPublishedItems,
      maxUsers: subPlanData?.maxUsers,
      historyRetentionDays: subPlanData?.historyRetentionDays,
      storageLimitMB: subPlanData?.storageLimitMB,
      maxSpaces: subPlanData?.maxSpaces,
      price: subPlanData?.price,
      currency: subPlanData?.currency ?? "USD",
      frequency: subPlanData?.frequency ?? "Monthly",
      status: subPlanData?.status ?? "Current",
      isDisabled: subPlanData?.isDisabled ?? false,
      // Read (view) only fields
      createdBy: subPlanData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: subPlanData?.createdOn ? new Date(subPlanData?.createdOn) : new Date(),
      lastModifiedBy:
        subPlanData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: subPlanData?.lastModifiedOn
        ? new Date(subPlanData?.lastModifiedOn)
        : new Date(),
    });

    // Focus the name field after reset.
    setTimeout(() => {
      form.setFocus("name", { shouldSelect: false });
    }, 0);
  }, [rowId, form, queryClient, userSession]);

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

  // Return form and methods
  return {
    form,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  };
};
