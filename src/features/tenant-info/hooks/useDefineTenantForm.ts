import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { DATA_QUERY_KEY } from "../constants";
import { tenantZodSchema } from "../constants/tenant-zod-schema";
import { TenantDto } from "../dtos/tenant-dto";

/**
 * Custom hook for defining a tenant form.
 *
 * @returns An object containing the form, form methods, and other related values.
 */
export const useDefineTenantForm = () => {
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
  const form = useForm<z.infer<typeof tenantZodSchema>>({
    resolver: zodResolver(tenantZodSchema),
    defaultValues: {
      id: "",
      name: "",
      expiresOn: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isTwoFAEnabled: false,
      isPwdEnabled: true,
      isSSOEnabled: false,
      ssoConfigJson: undefined,
      isPwdNeverExpiresEnabled: true,
      daysBeforePwdExpires: "730",
      isIdleSessionTimeoutEnabled: true,
      idleSessionTimeoutMinutes: "10",

      isDisabled: false,
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: new Date(),
    },
  });

  // Destructor form values and methods
  const {
    watch,
    formState: { isSubmitting, isDirty },
  } = form;

  // Fetch tenant data when rowId changes
  useEffect(() => {
    // Get tenants data from query client
    const tenantsData = queryClient.getQueryData<{
      data: TenantDto[];
    }>(DATA_QUERY_KEY);

    // Get tenant data by id
    const tenantData = tenantsData?.data.find((item) => item.id === rowId);

    // Set tenant data to form
    form.reset({
      // Single fields
      id: rowId,
      name: tenantData?.name ?? "",
      expiresOn: tenantData?.expiresOn
        ? new Date(tenantData?.expiresOn)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isTwoFAEnabled: tenantData?.isTwoFAEnabled ?? false,
      // Group
      isPwdEnabled: tenantData?.isPwdEnabled ?? true,
      isSSOEnabled: tenantData?.isSSOEnabled ?? false,
      ssoConfigJson: tenantData?.ssoConfigJson ?? undefined,
      // Group
      isPwdNeverExpiresEnabled: tenantData?.isPwdNeverExpiresEnabled ?? true,
      daysBeforePwdExpires:
        tenantData?.daysBeforePwdExpires?.toString() ?? "730",
      // Group
      isIdleSessionTimeoutEnabled:
        tenantData?.isIdleSessionTimeoutEnabled ?? true,
      idleSessionTimeoutMinutes:
        tenantData?.idleSessionTimeoutMinutes?.toString() ?? "10",

      // Single field
      isDisabled: tenantData?.isDisabled ?? false,
      // Group (read-only)
      createdBy:
        tenantData?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,
      createdOn: tenantData?.createdOn
        ? new Date(tenantData?.createdOn)
        : new Date(),
      lastModifiedBy:
        tenantData?.lastModifiedBy ??
        userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: tenantData?.lastModifiedOn
        ? new Date(tenantData?.lastModifiedOn)
        : new Date(),
    });
  }, [rowId, form, queryClient, userSession]);

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof tenantZodSchema>) => {
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
    watch,
    isSubmitting,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  };
};
