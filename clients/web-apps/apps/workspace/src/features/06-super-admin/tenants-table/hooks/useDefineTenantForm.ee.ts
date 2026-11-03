import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { DatabaseOptionsEnum } from "@avplatform/ui/enums/database-options-enum";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { isTenantNameAvailable } from "../apis/tenants-table-apis.ee";
import { DATA_QUERY_KEY } from "../constants";
import { tenantNameSchema, tenantZodSchema } from "../constants/tenant-zod-schema.ee";
import { TenantsTableDto } from "../dtos/tenants-table-dto.ee";
import { useDateRangePickerStore } from "../stores/date-range-store.ee";

interface UseDefineTenantFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a tenant form.
 *
 * @returns An object containing the form, form methods, and other related values.
 */
export const useDefineTenantForm = ({ rowId }: UseDefineTenantFormOptions) => {
  // Set tenant name state (required for avaialbility check)
  const [tenantName, setTenantName] = useState("");

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { setIsDirty } = useCrudDialogDirty();

  const { dateRange } = useDateRangePickerStore(
    useShallow((state) => ({ dateRange: state.dateRange })),
  );

  const from = format(dateRange!.from!, "yyyy-MM-dd");
  const to = format(dateRange!.to!, "yyyy-MM-dd");
  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof tenantZodSchema>>({
    resolver: zodResolver(tenantZodSchema),
    defaultValues: {
      id: "",
      name: "",
      domain: "",
      type: "",
      currency: "",
      effectiveDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      expiresOn: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isTwoFAEnabled: false,
      isChangeRequestEnabled: false,
      isPwdEnabled: true,
      isSSOEnabled: false,
      ssoConfigJson: undefined,
      isPwdNeverExpiresEnabled: true,
      daysBeforePwdExpires: "730",
      isIdleSessionTimeoutEnabled: true,
      idleSessionTimeoutMinutes: "10",
      dbOption: DatabaseOptionsEnum.Shared,
      dbNamePrefix: undefined,
      dbUserId: undefined,
      dbPwd: undefined,
      dbHost: undefined,
      dbPort: undefined,
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
    formState: { isDirty },
  } = form;

  // Fetch tenant data when rowId changes
  useEffect(() => {
    // Get tenants data from query client
    const tenantsData = queryClient.getQueryData<{
      data: TenantsTableDto[];
    }>([...DATA_QUERY_KEY, from, to]);

    // Get tenant data by id
    const tenantData = tenantsData?.data.find((item) => item.id === rowId);

    // Set tenant name
    setTenantName(tenantData?.name ?? "");

    // Set tenant data to form
    form.reset({
      // Single fields
      id: rowId,
      name: tenantData?.name ?? "",
      domain: tenantData?.domain ?? "",
      type: tenantData?.type ?? "",
      currency: tenantData?.currency ?? "",
      effectiveDate: tenantData?.effectiveDate
        ? new Date(tenantData?.effectiveDate)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      renewalDate: tenantData?.renewalDate
        ? new Date(tenantData?.renewalDate)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      expiresOn: tenantData?.expiresOn
        ? new Date(tenantData?.expiresOn)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isTwoFAEnabled: tenantData?.isTwoFAEnabled ?? false,
      isChangeRequestEnabled: tenantData?.isChangeRequestEnabled ?? false,
      // Group
      isPwdEnabled: tenantData?.isPwdEnabled ?? true,
      isSSOEnabled: tenantData?.isSSOEnabled ?? false,
      ssoConfigJson: undefined,
      // Group
      isPwdNeverExpiresEnabled: tenantData?.isPwdNeverExpiresEnabled ?? true,
      daysBeforePwdExpires: tenantData?.daysBeforePwdExpires?.toString() ?? "730",
      // Group
      isIdleSessionTimeoutEnabled: tenantData?.isIdleSessionTimeoutEnabled ?? true,
      idleSessionTimeoutMinutes: tenantData?.idleSessionTimeoutMinutes?.toString() ?? "10",
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
      createdBy: tenantData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: tenantData?.createdOn ? new Date(tenantData?.createdOn) : new Date(),
      lastModifiedBy:
        tenantData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: tenantData?.lastModifiedOn
        ? new Date(tenantData?.lastModifiedOn)
        : new Date(),
    });
  }, [rowId, form, queryClient, userSession]);

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof tenantZodSchema>, z.ZodString>({
    defaultInputValue: tenantName,
    fieldName: "name",
    form,
    fieldSchema: tenantNameSchema,
    checkAvailabilityAPIFn: isTenantNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof tenantZodSchema>) => {
    const refinedFormData = { ...formData };
    delete refinedFormData.ssoConfigJson;

    return {
      ...refinedFormData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  // Save the form dirty state
  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Reset availability message when component unmounts
  useEffect(() => {
    return () => {
      setAvailabilityMessage(null);
    };
  }, [setAvailabilityMessage]);

  // Return form and methods
  return {
    form,
    watch,
    isDirty,
    refineFormData,
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  };
};
