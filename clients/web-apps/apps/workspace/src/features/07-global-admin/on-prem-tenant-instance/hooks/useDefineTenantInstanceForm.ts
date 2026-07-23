import { CheckAvailabilityDto } from "@avplatform/ui/dtos";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { isTenantInstanceNameAvailable } from "../apis/tenant-instance-apis";
import { TENANT_INSTANCE_QUERY_KEY } from "../constants";
import {
  tenantInstanceNameSchema,
  tenantInstanceZodSchema,
} from "../constants/tenant-instance-zod-schema";
import { OnPremInstanceDto } from "../dtos/tenant-instance-dto";

/**
 * Custom hook for defining a OnPremTenant form.
 */
export const useDefineTenantInstanceForm = () => {
  const { tid } = useParams();
  // Set tenant name state (required for availability check)
  const [tenantName, setTenantName] = useState("");

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
  const form = useForm<z.infer<typeof tenantInstanceZodSchema>>({
    resolver: zodResolver(tenantInstanceZodSchema),
    defaultValues: {
      id: "",
      name: "",
      type: "",
      isDisabled: false,
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
      data: OnPremInstanceDto[];
    }>([TENANT_INSTANCE_QUERY_KEY, tid]);

    // Get tenant data by id
    const onPremTenantData = onPremTenantsData?.data.find((item) => item.id === rowId);

    // Set tenant name
    setTenantName(onPremTenantData?.name ?? "");

    // Set flow data to form
    form.reset({
      id: rowId,
      name: onPremTenantData?.name ?? "",
      type: onPremTenantData?.type ?? "",
      isDisabled: onPremTenantData?.isDisabled ?? false,
    });

    // Focus the name field after reset.
    setTimeout(() => {
      form.setFocus("name", { shouldSelect: false });
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, queryClient, rowId]);

  const checkTenantInstanceAvailability = (postObj: CheckAvailabilityDto) => {
    return isTenantInstanceNameAvailable(tid || "", postObj);
  };

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof tenantInstanceZodSchema>, z.ZodString>({
    defaultInputValue: tenantName,
    fieldName: "name",
    form,
    fieldSchema: tenantInstanceNameSchema,
    checkAvailabilityAPIFn: checkTenantInstanceAvailability,
  });

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
    id: tid,
    crudAction,
    setShowDialog,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
