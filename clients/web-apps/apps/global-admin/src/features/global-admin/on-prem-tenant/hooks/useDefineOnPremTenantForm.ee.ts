import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { getUserDisplayName } from "@avplatform/ui/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { isOnPremTenantNameAvailable } from "../apis/on-prem-tenant-apis.ee";
import { ON_PREM_TENANT_QUERY_KEY } from "../constants";
import {
  onPremTenantNameSchema,
  onPremTenantZodSchema,
} from "../constants/on-prem-tenant-zod-schema.ee";
import { OnPremTenantDto } from "../dtos/on-prem-tenant-dto.ee";

interface UseDefineOnPremTenantFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a OnPremTenant form.
 */
export const useDefineOnPremTenantForm = ({ rowId }: UseDefineOnPremTenantFormOptions) => {
  // Set tenant name state (required for availability check)
  const [tenantName, setTenantName] = useState("");

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { setIsDirty } = useCrudDialogDirty();

  // Get query client
  const queryClient = useQueryClient();

  const currDate = new Date();
  // Define form with zod schema
  const form = useForm<z.infer<typeof onPremTenantZodSchema>>({
    resolver: zodResolver(onPremTenantZodSchema),
    defaultValues: {
      id: "",
      type: "Enterprise",
      name: "",
      executionTimeAllowed: 0,
      contractStartDate: currDate,
      contractRenewalDate: currDate,
      ourEmails: "",
      tenantEmails: "",
      isExecutionDisabled: false,
      isLoginDisabled: false,
      isSsoAllowed: false,
      isBrandingAllowed: false,
      createdByUser: getUserDisplayName(userSession),
      createdOn: currDate,
      lastModifiedByUser: getUserDisplayName(userSession),
      lastModifiedOn: currDate,
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch flow data when rowId changes
  useEffect(() => {
    // Get tenant data from query client
    const onPremTenantsData = queryClient.getQueryData<{
      data: OnPremTenantDto[];
    }>(ON_PREM_TENANT_QUERY_KEY);

    // Get tenant data by id
    const onPremTenantData = onPremTenantsData?.data.find((item) => item.id === rowId);

    // Set tenant name
    setTenantName(onPremTenantData?.name ?? "");

    // Set flow data to form
    form.reset({
      id: rowId,
      type: onPremTenantData?.type ?? "Enterprise",
      name: onPremTenantData?.name ?? "",
      executionTimeAllowed: onPremTenantData?.executionTimeAllowed ?? 0,
      ourEmails: onPremTenantData?.ourEmails ?? "",
      tenantEmails: onPremTenantData?.tenantEmails ?? "",
      contractStartDate: onPremTenantData?.contractStartDate
        ? new Date(onPremTenantData?.contractStartDate)
        : currDate,
      contractRenewalDate: onPremTenantData?.contractRenewalDate
        ? new Date(onPremTenantData?.contractRenewalDate)
        : currDate,
      isExecutionDisabled: onPremTenantData?.isExecutionDisabled ?? false,
      isLoginDisabled: onPremTenantData?.isLoginDisabled ?? false,
      isSsoAllowed: onPremTenantData?.isSsoAllowed ?? false,
      isBrandingAllowed: onPremTenantData?.isBrandingAllowed ?? false,
      // Read (view) only fields
      createdByUser: onPremTenantData?.createdByUser ?? getUserDisplayName(userSession),
      createdOn: onPremTenantData?.createdOn ? new Date(onPremTenantData?.createdOn) : currDate,
      lastModifiedByUser: onPremTenantData?.lastModifiedByUser ?? getUserDisplayName(userSession),
      lastModifiedOn: onPremTenantData?.lastModifiedOn
        ? new Date(onPremTenantData?.lastModifiedOn)
        : currDate,
    });

    // Focus the name field after reset.
    setTimeout(() => {
      form.setFocus("name", { shouldSelect: false });
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, queryClient, rowId]);

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof onPremTenantZodSchema>, z.ZodString>({
    defaultInputValue: tenantName,
    fieldName: "name",
    form,
    fieldSchema: onPremTenantNameSchema,
    checkAvailabilityAPIFn: isOnPremTenantNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof onPremTenantZodSchema>) => {
    return {
      ...formData,
      contractStartDate: formData.contractStartDate.toISOString(),
      contractRenewalDate: formData.contractRenewalDate.toISOString(),
      createdOn: formData.createdOn.toISOString(),
      lastModifiedByUser: userSession?.email ?? "",
      lastModifiedOn: currDate.toISOString(),
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
    isDirty,
    refineFormData,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
