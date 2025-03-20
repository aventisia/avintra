import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useShallow } from 'zustand/react/shallow';

import { useCheckAvailability } from '@/react-toolkit/hooks/useCheckAvailability';
import { useDTCrudDialogStore } from '@/react-toolkit/stores/dt-crud-dialog-store';
import { useUserSessionStore } from '@/react-toolkit/stores/user-session-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

import { isLicenseNameAvailable } from '../apis/licenses-table-apis';
import { DATA_QUERY_KEY } from '../constants';
import { licenseNameSchema, licenseZodSchema } from '../constants/license-zod-schema';
import { LicensesTableDto } from '../dtos/licenses-table-dto';

/**
 * Custom hook for defining a license form.
 */
export const useDefineLicenseForm = () => {
  // Set license name state (required for avaialbility check)
  const [licenseName, setLicenseName] = useState("");

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
  const form = useForm<z.infer<typeof licenseZodSchema>>({
    resolver: zodResolver(licenseZodSchema),
    defaultValues: {
      id: "",
      type: "",
      name: "",
      description: "",
      isDisabled: false,
      flowCount: 0,
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

  // Fetch license data when rowId changes
  useEffect(() => {
    // Get licenses data from query client
    const licensesData = queryClient.getQueryData<{
      data: LicensesTableDto[];
    }>(DATA_QUERY_KEY);

    // Get license data by id
    const licenseData = licensesData?.data.find((item) => item.id === rowId);

    // Set license name
    setLicenseName(licenseData?.name ?? "");

    // Set license data to form
    form.reset({
      id: rowId,
      type: licenseData?.type ?? "",
      name: licenseData?.name ?? "",
      description: licenseData?.description ?? "",
      isDisabled: licenseData?.isDisabled ?? false,
      // Read (view) only fields
      flowCount: licenseData?.flowCount ?? 0,
      createdBy:
        licenseData?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,
      createdOn: licenseData?.createdOn
        ? new Date(licenseData?.createdOn)
        : new Date(),
      lastModifiedBy:
        licenseData?.lastModifiedBy ??
        userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: licenseData?.lastModifiedOn
        ? new Date(licenseData?.lastModifiedOn)
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
  } = useCheckAvailability<z.infer<typeof licenseZodSchema>, z.ZodString>({
    defaultInputValue: licenseName,
    fieldName: "name",
    form,
    fieldSchema: licenseNameSchema,
    checkAvailabilityAPIFn: isLicenseNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof licenseZodSchema>) => {
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
