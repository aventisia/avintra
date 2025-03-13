import { useCheckAvailability } from "@/react-toolkit/hooks/useCheckAvailability";
import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { isConfigNameAvailable } from "../apis/configs-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import {
  configNameSchema,
  configZodSchema,
} from "../constants/config-zod-schema";
import { ConfigsTableDto } from "../dtos/configs-table-dto";

/**
 * Custom hook for defining a config form.
 */
export const useDefineConfigForm = () => {
  // Set config name state (required for avaialbility check)
  const [configName, setConfigName] = useState("");

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

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
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof configZodSchema>>({
    resolver: zodResolver(configZodSchema),
    defaultValues: {
      id: "",
      type: "",
      name: "",
      value: "",
      accessLevel: "",
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

  // Fetch config data when rowId changes
  useEffect(() => {
    // Get configs data from query client
    const configsData = queryClient.getQueryData<{
      data: ConfigsTableDto[];
    }>(DATA_QUERY_KEY);

    // Get config data by id
    const configData = configsData?.data.find((item) => item.id === rowId);

    // Set config name
    setConfigName(configData?.name ?? "");

    // Set config data to form
    form.reset({
      id: rowId,
      type: configData?.type ?? "",
      name: configData?.name ?? "",
      value: "",
      accessLevel: configData?.accessLevel ?? "",
      isEncrypted: configData?.isEncrypted ?? false,

      isDisabled: configData?.isDisabled ?? false,
      // Read (view) only fields
      createdBy:
        configData?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,
      createdOn: configData?.createdOn
        ? new Date(configData?.createdOn)
        : new Date(),
      lastModifiedBy:
        configData?.lastModifiedBy ??
        userSession?.firstName + " " + userSession?.lastName,
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
  } = useCheckAvailability<z.infer<typeof configZodSchema>, z.ZodString>({
    defaultInputValue: configName,
    fieldName: "name",
    form,
    fieldSchema: configNameSchema,
    checkAvailabilityAPIFn: isConfigNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof configZodSchema>) => {
    return {
      ...formData,
      tenantId: userSession?.tenantId,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

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
    crudAction,
    setShowDialog,
    refineFormData,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
