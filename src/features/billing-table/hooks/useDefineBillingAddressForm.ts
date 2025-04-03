import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { DATA_QUERY_KEY } from "../constants";
import { billingAddressZodSchema } from "../constants/billing-address-zod-schema";
import { BillingAddressDto } from "../dtos/billing-address-dto";

/**
 * Custom hook for defining a billingplan form.
 *
 * @returns An object containing the form, form methods, and other related values.
 */
export const useDefineBillingAddressForm = () => {
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
  const form = useForm<z.infer<typeof billingAddressZodSchema>>({
    resolver: zodResolver(billingAddressZodSchema),
    defaultValues: {
      id: "",
      name: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      city: "",
      state: "",
      country: "",
      taxId: "",
      pinCode: "",
      isDisabled: false,
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: new Date(),
    },
  });

  // Destructor form values and methods
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // Fetch billingplan data when rowId changes
  useEffect(() => {
    // Get billingplans data from query client
    const billingAddresses = queryClient.getQueryData<{
      data: BillingAddressDto[];
    }>(DATA_QUERY_KEY);

    // Get billingplan data by id
    const data = billingAddresses?.data.find((item) => item.id === rowId);

    // Set billingplan data to form
    form.reset({
      // Single fields
      id: data?.id ?? "",
      name: data?.name ?? "",
      email: data?.email ?? "",
      addressLine1: data?.addressLine1 ?? "",
      addressLine2: data?.addressLine2 ?? "",
      addressLine3: data?.addressLine3 ?? "",
      city: data?.city ?? "",
      state: data?.state ?? "",
      country: data?.country ?? "",
      taxId: data?.taxId ?? "",
      pinCode: data?.pinCode ?? "",

      // Single field
      isDisabled: data?.isDisabled ?? false,
      // Group (read-only)
      createdBy:
        data?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: data?.createdOn ? new Date(data?.createdOn) : new Date(),
      lastModifiedBy:
        data?.lastModifiedBy ??
        userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: data?.lastModifiedOn
        ? new Date(data?.lastModifiedOn)
        : new Date(),
    });
  }, [rowId, form, queryClient, userSession]);

  // Refine form data based on crud action
  const refineFormData = (
    formData: z.infer<typeof billingAddressZodSchema>,
  ) => {
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
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  };
};
