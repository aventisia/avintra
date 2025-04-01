import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useShallow } from 'zustand/react/shallow';

import { useCheckAvailability } from '@/react-toolkit/hooks/useCheckAvailability';
import { useDTCrudDialogStore } from '@/react-toolkit/stores/dt-crud-dialog-store';
import { useUserSessionStore } from '@/react-toolkit/stores/user-session-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

import { isNameAvailable } from '../apis/executions-table-apis';
import { DATA_QUERY_KEY } from '../constants';
import { executionNameSchema, executionZodSchema } from '../constants/execution-zod-schema';
import { ExecutionsTableDto } from '../dtos/executions-table-dto';

/**
 * Custom hook for defining a execution form.
 */
export const useDefineExecutionForm = () => {
  // Set execution name state (required for avaialbility check)
  const [executionName, setexecutionName] = useState("");

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
  const form = useForm<z.infer<typeof executionZodSchema>>({
    resolver: zodResolver(executionZodSchema),
    defaultValues: {
      id: "",
      name: "",
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

  // Fetch execution data when rowId changes
  useEffect(() => {
    // Get executions data from query client
    const executionsData = queryClient.getQueryData<{
      data: ExecutionsTableDto[];
    }>(DATA_QUERY_KEY);

    // Get execution data by id
    const executionData = executionsData?.data.find((item) => item.id === rowId);

    // Set execution name
    setexecutionName(executionData?.name ?? "");

    // Set execution data to form
    form.reset({
      id: rowId,
      name: executionData?.name ?? "",
      isDisabled: executionData?.isDisabled ?? false,
      // Read (view) only fields
      createdBy:
        executionData?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,
      createdOn: executionData?.createdOn
        ? new Date(executionData?.createdOn)
        : new Date(),
      lastModifiedBy:
        executionData?.lastModifiedBy ??
        userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: executionData?.lastModifiedOn
        ? new Date(executionData?.lastModifiedOn)
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
  } = useCheckAvailability<z.infer<typeof executionZodSchema>, z.ZodString>({
    defaultInputValue: executionName,
    fieldName: "name",
    form,
    fieldSchema: executionNameSchema,
    checkAvailabilityAPIFn: isNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof executionZodSchema>) => {
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
