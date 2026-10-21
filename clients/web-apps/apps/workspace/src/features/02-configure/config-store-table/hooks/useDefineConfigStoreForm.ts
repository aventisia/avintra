import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { getMergedQueryData } from "@/utils/get-merged-query-data.util";

import { isConfigStoreNameAvailable } from "../apis/config-stores-table-apis";
import { configStoreNameSchema, configStoreZodSchema } from "../constants/config-store-zod-schema";
import { ConfigStoresTableDto } from "../dtos/config-stores-table-dto";
import { useTableTab } from "./useTableTab";

interface UseDefineConfigStoreFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a config store form.
 */
export const useDefineConfigStoreForm = ({
  rowId,
  crudAction,
}: UseDefineConfigStoreFormOptions) => {
  // Set config store name state (required for availability check)
  const [configStoreName, setConfigStoreName] = useState("");

  const { setIsDirty } = useCrudDialogDirty();

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof configStoreZodSchema>>({
    resolver: zodResolver(configStoreZodSchema),
    defaultValues: {
      id: "",
      type: "TEXT",
      name: "",
      value: "",
      description: "",
      tags: "",
      isEncrypted: false,
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

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Fetch config store data when rowId changes
  useEffect(() => {
    // Get config stores data from the merged Personal/Shared lists in the cache
    const configStoresData = getMergedQueryData<ConfigStoresTableDto>(queryClient, queryKey);

    // Get config store data by id
    const configStoreData = configStoresData?.data.find((item) => item.id === rowId);

    // Set config store name
    setConfigStoreName(configStoreData?.name ?? "");

    // Set config store data to form
    form.reset({
      id: rowId,
      type: configStoreData?.type ?? "TEXT",
      name: configStoreData?.name ?? "",
      value: configStoreData?.value ?? "",
      description: configStoreData?.description ?? "",
      isDisabled: configStoreData?.isDisabled,
      // Read (view) only fields
      createdBy: configStoreData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: configStoreData?.createdOn ? new Date(configStoreData?.createdOn) : new Date(),
      lastModifiedBy:
        configStoreData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: configStoreData?.lastModifiedOn
        ? new Date(configStoreData?.lastModifiedOn)
        : new Date(),
    });
  }, [rowId, form, queryClient, userSession, queryKey]);

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof configStoreZodSchema>, z.ZodString>({
    defaultInputValue: configStoreName,
    fieldName: "name",
    form,
    fieldSchema: configStoreNameSchema,
    checkAvailabilityAPIFn: isConfigStoreNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof configStoreZodSchema>) => {
    return {
      ...formData,
      tenantId: userSession?.tenantId,
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
    refineFormData,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
