import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { isKeystoreNameAvailable } from "../apis/keystores-table-apis";
import { keystoreNameSchema, keystoreZodSchema } from "../constants/keystore-zod-schema";
import { KeystoresTableDto } from "../dtos/keystores-table-dto";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook for defining a keystore form.
 */
export const useDefineKeystoreForm = () => {
  // Set keystore name state (required for avaialbility check)
  const [keystoreName, setKeystoreName] = useState("");

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
  const form = useForm<z.infer<typeof keystoreZodSchema>>({
    resolver: zodResolver(keystoreZodSchema),
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

  // Fetch keystore data when rowId changes
  useEffect(() => {
    // Get keystores data from query client
    const keystoresData = queryClient.getQueryData<{
      data: KeystoresTableDto[];
    }>(queryKey);

    // Get keystore data by id
    const keystoreData = keystoresData?.data.find((item) => item.id === rowId);

    // Set keystore name
    setKeystoreName(keystoreData?.name ?? "");

    // Set keystore data to form
    form.reset({
      id: rowId,
      type: keystoreData?.type ?? "TEXT",
      name: keystoreData?.name ?? "",
      value: keystoreData?.value ?? "",
      description: keystoreData?.description ?? "",
      isDisabled: keystoreData?.isDisabled,
      // Read (view) only fields
      createdBy: keystoreData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: keystoreData?.createdOn ? new Date(keystoreData?.createdOn) : new Date(),
      lastModifiedBy:
        keystoreData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: keystoreData?.lastModifiedOn
        ? new Date(keystoreData?.lastModifiedOn)
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
  } = useCheckAvailability<z.infer<typeof keystoreZodSchema>, z.ZodString>({
    defaultInputValue: keystoreName,
    fieldName: "name",
    form,
    fieldSchema: keystoreNameSchema,
    checkAvailabilityAPIFn: isKeystoreNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof keystoreZodSchema>) => {
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
