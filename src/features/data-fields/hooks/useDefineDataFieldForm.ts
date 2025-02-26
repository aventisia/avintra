import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { modelZodSchema } from "../constants/data-field-zod-schema";
import { DataFieldsDto } from "../dtos/data-fields-dtos";
import { useModelDataStore } from "@/features/label-data/stores/model-data-store";

/**
 * Custom hook for defining a model form.
 */
export const useDefineDataFieldForm = () => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  // Get model data store state and actions
  const { modelId, labelDataQueryKey } = useModelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
      labelDataQueryKey: state.labelDataQueryKey,
    })),
  );
  // Get data-table crud dialog store state and actions
  const {
    crudDialogOptions: { rowId, crudAction },
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
      type: "",
      name: "",
      color: "",
      description: "",
      mlModelId: modelId || "",
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch model data when rowId changes
  useEffect(() => {
    // Get models data from query client
    const dataFields = queryClient.getQueryData<{
      data: DataFieldsDto[];
    }>(labelDataQueryKey);

    // Get model data by id
    const datafield = dataFields?.data.find((item) => item.id === rowId);
    // Set model data to form
    form.reset({
      id: rowId,
      type: datafield?.type ?? "",
      name: datafield?.name ?? "",
      description: datafield?.description ?? "",
      color: datafield?.color ?? "",
      mlModelId: modelId || "",
      // Read (view) only fields
      createdBy:
        datafield?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,
      createdOn: datafield?.createdOn
        ? new Date(datafield?.createdOn)
        : new Date(),
    });
  }, [rowId, form, queryClient, userSession, modelId, labelDataQueryKey]);

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof modelZodSchema>) => {
    return {
      ...formData,
      // lastModifiedBy: userSession?.email ?? "",
      // lastModifiedOn: new Date().toISOString(),
    };
  };

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  // Return form and methods
  return {
    form,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  };
};
