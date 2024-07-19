import { useForm } from "react-hook-form";
import { z } from "zod";
import { tenantZodSchema } from "../constants/tenant-zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { TenantsTableDto } from "../dtos/tenants-table-dto";
import { DATA_QUERY_KEY } from "../constants/constants";
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
      id: rowId,
      name: tenantData?.name ?? "",
      expiresOn: tenantData?.expiresOn
        ? new Date(tenantData?.expiresOn)
        : new Date(),
      isSSOEnabled: tenantData?.isSSOEnabled,
      isPwdEnabled: tenantData?.isPwdEnabled,
      isPwdNeverExpiresEnabled: tenantData?.isPwdNeverExpiresEnabled,
      daysBeforePwdExpires: tenantData?.daysBeforePwdExpires?.toString(),
      isIdleSessionTimeoutEnabled: tenantData?.isIdleSessionTimeoutEnabled,
      idleSessionTimeoutMinutes:
        tenantData?.idleSessionTimeoutMinutes?.toString(),
      isTwoFAEnabled: tenantData?.isTwoFAEnabled,
      ssoConfigJson: tenantData?.ssoConfigJson ?? "",
      dbOption:
        tenantData?.dbOption?.toString() ??
        DatabaseOptionsEnum.Shared.toString(),
      dbUserId: tenantData?.dbUserId ?? "",
      dbPwd: tenantData?.dbPwd ?? "",
      dbHost: tenantData?.dbHost,
      dbPort: tenantData?.dbPort?.toString(),
      dbNamePrefix: tenantData?.dbNamePrefix ?? "_",
      isDisabled: tenantData?.isDisabled,
      // Read (view) only fields
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
