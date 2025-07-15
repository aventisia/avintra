import { useCheckAvailability } from "@aventisia/ui/hooks";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { isModelNameAvailable } from "../apis/models-table-apis";
import { MODELS_QUERY_KEY } from "../constants";
import { modelNameSchema, modelZodSchema } from "../constants/model-zod-schema";
import { ModelsTableDto } from "../dtos/models-table-dto";

/**
 * Custom hook for defining a model form.
 */
export const useDefineModelForm = () => {
  // Set model name state (required for avaialbility check)
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
  const form = useForm<z.infer<typeof modelZodSchema>>({
    resolver: zodResolver(modelZodSchema),
    defaultValues: {
      id: "",
      type: null,
      name: "",
      llm: "N/A",
      description: "",
      setupStatus: "Pending",
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      trainedOn: new Date(),
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
      data: ModelsTableDto[];
    }>(MODELS_QUERY_KEY);

    // Get model data by id
    const modelData = modelsData?.data.find((item) => item.id === rowId);

    // Set model name
    setModelName(modelData?.name ?? "");

    // Set model data to form
    form.reset({
      id: rowId,
      type: modelData?.type ?? null,
      name: modelData?.name ?? "",
      description: modelData?.description ?? "",
      // Read (view) only fields
      llm: modelData?.llm ?? "N/A",
      setupStatus: modelData?.setupStatus ?? "Pending",
      createdBy:
        modelData?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,
      createdOn: modelData?.createdOn
        ? new Date(modelData?.createdOn)
        : new Date(),
      trainedOn: modelData?.trainedOn
        ? new Date(modelData?.trainedOn)
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
  } = useCheckAvailability<z.infer<typeof modelZodSchema>, z.ZodString>({
    defaultInputValue: modelName,
    fieldName: "name",
    form,
    fieldSchema: modelNameSchema,
    checkAvailabilityAPIFn: isModelNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof modelZodSchema>) => {
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
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
