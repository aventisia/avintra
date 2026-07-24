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

import { isVaultNameAvailable } from "../apis/vaults-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { vaultNameSchema, vaultZodSchema } from "../constants/vault-zod-schema";
import { VaultsTableDto } from "../dtos/vaults-table-dto";

interface UseDefineVaultFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a config form.
 */
export const useDefineVaultForm = ({ rowId, crudAction }: UseDefineVaultFormOptions) => {
  // Set config name state (required for avaialbility check)
  const [configName, setConfigName] = useState("");

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
  const form = useForm<z.infer<typeof vaultZodSchema>>({
    resolver: zodResolver(vaultZodSchema),
    defaultValues: {
      id: "",
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      description: "",
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

  // Fetch config data when rowId changes
  useEffect(() => {
    // Get configs data from query client
    const configsData = queryClient.getQueryData<{
      data: VaultsTableDto[];
    }>(DATA_QUERY_KEY);

    // Get config data by id
    const configData = configsData?.data.find((item) => item.id === rowId);

    // Set config name
    setConfigName(configData?.name ?? "");

    // Set config data to form
    form.reset({
      id: rowId,
      name: configData?.name ?? "",

      // username: configData?.username,
      // password: configData?.password,
      description: configData?.description,

      isDisabled: configData?.isDisabled ?? false,
      // Read (view) only fields
      createdBy: configData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: configData?.createdOn ? new Date(configData?.createdOn) : new Date(),
      lastModifiedBy:
        configData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: configData?.lastModifiedOn
        ? new Date(configData?.lastModifiedOn)
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
  } = useCheckAvailability<z.infer<typeof vaultZodSchema>, z.ZodString>({
    defaultInputValue: configName,
    fieldName: "name",
    form,
    fieldSchema: vaultNameSchema,
    checkAvailabilityAPIFn: isVaultNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof vaultZodSchema>) => {
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
