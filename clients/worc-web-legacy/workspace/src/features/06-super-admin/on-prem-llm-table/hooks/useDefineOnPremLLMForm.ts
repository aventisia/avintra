import { useCheckAvailability } from "@aventisia/ui/hooks";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { isModelNameAvailable } from "../apis/on-prem-llm-table-apis";
import { ONPREM_LLM_QUERY_KEY } from "../constants";
import {
  onPremLLMNameSchema,
  onPremLLMZodSchema,
} from "../constants/on-prem-llms-zod-schema";
import { OnPremModelDto } from "../dtos/on-prem-llm-table-dto";

/**
 * Custom hook for defining a model form.
 */
export const useDefineOnPremLLMForm = () => {
  // Set model name state (required for availability check)
  const [modelName, setModelName] = useState("");

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
  const form = useForm<z.infer<typeof onPremLLMZodSchema>>({
    resolver: zodResolver(onPremLLMZodSchema),
    defaultValues: {
      id: rowId,
      providerType: "Ollama",
      status: "Uninstalled",
      name: "",
      description: "",
      modelName: "",
      providerUrl: "",
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

  // Fetch model data when rowId changes
  useEffect(() => {
    // Get models data from query client
    const modelsData = queryClient.getQueryData<{
      data: OnPremModelDto[];
    }>(ONPREM_LLM_QUERY_KEY);

    // Get model data by id
    const modelData = modelsData?.data.find((item) => item.id === rowId);

    // Set model name
    setModelName(modelData?.name ?? "");

    // Set model data to form
    if (modelData)
      form.reset({
        id: rowId,
        providerType: modelData?.providerType,
        name: modelData?.name,
        modelName: modelData?.modelName,
        description: modelData?.description ?? "",
        providerUrl: modelData?.providerUrl ?? "",
        status: modelData?.status ?? "",
        isDisabled: modelData?.isDisabled ?? false,
        // Read (view) only fields
        createdBy:
          modelData?.createdBy ??
          userSession?.firstName + " " + userSession?.lastName,
        createdOn: modelData?.createdOn
          ? new Date(modelData?.createdOn)
          : new Date(),
        lastModifiedBy:
          modelData?.lastModifiedBy ??
          userSession?.firstName + " " + userSession?.lastName,
        lastModifiedOn: modelData?.lastModifiedOn
          ? new Date(modelData?.lastModifiedOn)
          : new Date(),
      });

    // Focus the name field after reset.
    setTimeout(() => {
      form.setFocus("name", { shouldSelect: false });
    }, 0);
  }, [rowId, form, queryClient, userSession]);

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof onPremLLMZodSchema>, z.ZodString>({
    defaultInputValue: modelName,
    fieldName: "name",
    form,
    fieldSchema: onPremLLMNameSchema,
    checkAvailabilityAPIFn: isModelNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof onPremLLMZodSchema>) => {
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
    isCheckPending,
    handleInputChange,
  };
};
