import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { DATA_QUERY_KEY } from "../constants";
import { licenseZodSchema } from "../constants/license-zod-schema";
import { MyLicensesTableDto } from "../dtos/licenses-table-dto";

/**
 * Custom hook for defining a license form.
 */
export const useDefineLicenseForm = () => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const [currentLicenseData, setCurrentLicenseData] =
    useState<MyLicensesTableDto>();

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
  const form = useForm<z.infer<typeof licenseZodSchema>>({
    resolver: zodResolver(licenseZodSchema),
    defaultValues: {
      id: "",
      planId: "",
      additionalUnitsRequested: undefined,
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
    watch,
  } = form;

  // Fetch license data when rowId changes
  useEffect(() => {
    // Get licenses data from query client
    const licensesData = queryClient.getQueryData<{
      data: MyLicensesTableDto[];
    }>(DATA_QUERY_KEY);

    // Get license data by id
    const licenseData = licensesData?.data.find((item) => item.id === rowId);

    setCurrentLicenseData(licenseData);
    // Set license data to form
    form.reset({
      id: rowId,
      planId: licenseData?.planId,
      additionalUnitsRequested: licenseData?.additionalUnitsRequested,
    });
  }, [rowId, form, queryClient, userSession]);

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof licenseZodSchema>) => {
    return {
      ...formData,
      id: userSession?.tenantId,
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
    currentLicenseData,
    watch,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  };
};
