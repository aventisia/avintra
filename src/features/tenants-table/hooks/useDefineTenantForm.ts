import {
  TenantsTableDto,
  tenantZodSchema,
  DATA_QUERY_KEY,
} from "@/features/tenants-table";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserSessionStore } from "@/react-toolkit/stores";
import { useDTCrudDialogStore } from "@/react-toolkit/components/data-table";
import { DatabaseOptionsEnum } from "@/react-toolkit/enums";

/**
 * Custom hook for defining a tenant form.
 *
 * @returns An object containing the form, form methods, and other related values.
 */
export const useDefineTenantForm = () => {
  // 1. Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // 2. Get crud dialog store state and actions
  const {
    crudDialogOptions: { rowId, crudAction },
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
    })),
  );

  // 3. Get query client
  const queryClient = useQueryClient();

  // 4. Define form with zod schema
  const form = useForm<z.infer<typeof tenantZodSchema>>({
    resolver: zodResolver(tenantZodSchema),
  });

  // 5. Destructor form values and methods
  const {
    watch,
    formState: { isSubmitting, isDirty },
  } = form;

  // 6. Fetch tenant data when rowId changes
  useEffect(() => {
    // Get tenants data from query client
    const tenantsData = queryClient.getQueryData<{
      data: TenantsTableDto[];
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
      // Group
      dbOption: tenantData?.dbOption ?? DatabaseOptionsEnum.Shared,
      dbNamePrefix: tenantData?.dbNamePrefix ?? undefined,
      // Sub-group
      dbUserId: tenantData?.dbUserId ?? undefined,
      dbPwd: tenantData?.dbPwd ?? undefined,
      // Sub-group
      dbHost: tenantData?.dbHost ?? undefined,
      dbPort: tenantData?.dbPort?.toString() ?? undefined,
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

  // 7. Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof tenantZodSchema>) => {
    return {
      ...formData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  // 8. Return form and methods
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
