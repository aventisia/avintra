import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { isEmailAvailable } from "@/react-toolkit/apis/accounts-auth-apis";

import { DATA_QUERY_KEY } from "../constants";
import { userEmailSchema, userZodSchema } from "../constants/user-zod-schema";
import { UsersTableDto } from "../dtos/users-table-dto";

/**
 * Custom hook for defining a user form.
 */
export const useDefineUserForm = () => {
  // Set user email state (required for avaialbility check)
  const [userEmail, setUserEmail] = useState("");

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
  const form = useForm<z.infer<typeof userZodSchema>>({
    resolver: zodResolver(userZodSchema),
    defaultValues: {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      userRoles: [],
      twoFactorEnabled: false,
      isDisabled: false,
      unlockAccount: false,
      lockoutEnd: undefined,
      emailConfirmed: false,
      pwdSetOn: undefined,
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: new Date(),
    },
  });

  // Desctructure form's methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch user data when rowId changes
  useEffect(() => {
    // Get users data from query client
    const usersData = queryClient.getQueryData<{
      data: UsersTableDto[];
    }>(DATA_QUERY_KEY);

    // Get user data by id
    const userData = usersData?.data.find((item) => item.id === rowId);

    // Set user email
    setUserEmail(userData?.email ?? "");

    // Set user data to form
    form.reset({
      id: rowId,
      firstName: userData?.firstName ?? "",
      lastName: userData?.lastName ?? "",
      email: userData?.email ?? "",
      userRoles: userData?.userRoles ?? [],
      twoFactorEnabled: userData?.twoFactorEnabled ?? false,
      isDisabled: userData?.isDisabled ?? false,
      unlockAccount: false, // Field Should be visible only if unlock account is required
      // Read (view) only fields
      lockoutEnd: userData?.lockoutEnd ? new Date(userData?.lockoutEnd) : undefined,
      emailConfirmed: userData?.emailConfirmed ?? false,
      pwdSetOn: userData?.pwdSetOn ? new Date(userData?.pwdSetOn) : undefined,
      createdBy: userData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: userData?.createdOn ? new Date(userData?.createdOn) : new Date(),
      lastModifiedBy:
        userData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: userData?.lastModifiedOn ? new Date(userData?.lastModifiedOn) : new Date(),
    });
  }, [rowId, form, queryClient, userSession]);

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof userZodSchema>, z.ZodString>({
    defaultInputValue: userEmail,
    fieldName: "email",
    form,
    fieldSchema: userEmailSchema,
    checkAvailabilityAPIFn: isEmailAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof userZodSchema>) => {
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
