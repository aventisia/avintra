import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useShallow } from 'zustand/react/shallow';

import { useDTCrudDialogStore } from '@/react-toolkit/stores/dt-crud-dialog-store';
import { useUserSessionStore } from '@/react-toolkit/stores/user-session-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

import { DATA_QUERY_KEY } from '../constants';
import { recordPaymentZodSchema } from '../constants/saLicense-zod-schema';
import { LicensesTableDto } from '../dtos/sa-licenses-table-dto';

/**
 * Custom hook for defining a license form.
 */
export const useDefineRecordPaymentForm = () => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
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

  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof recordPaymentZodSchema>>({
    resolver: zodResolver(recordPaymentZodSchema),
    defaultValues: {
      id: "",
      planId: "",
      dateReceived: new Date(),
      writeOffRemainingDues: false,
      amountReceived: undefined,
    },
  });

  useEffect(() => {
    const pricingplansData = queryClient.getQueryData<{
      data: LicensesTableDto[];
    }>(DATA_QUERY_KEY);

    const data = pricingplansData?.data.find((item) => item.id === rowId);

    // Set pricingplan data to form
    form.reset({
      // Single fields
      id: rowId,
      planId: data?.planId,
      dateReceived: new Date(),
      writeOffRemainingDues: false,
      additionalUnitsRequested: data?.additionalUnitsRequested,
      amountReceived: undefined,
    });
  }, [rowId, form, queryClient, userSession]);

  // Destructor form values and methods
  const {
    formState: { isDirty },
    watch,
  } = form;

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof recordPaymentZodSchema>) => {
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

  // Return form and methods
  return {
    form,
    watch,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  };
};
