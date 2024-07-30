import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { DATA_QUERY_KEY } from "../constants/constants";
import { userZodSchema } from "../constants/user-zod-schema";
import { UsersTableDto } from "../dtos/users-table-dto";

/**
 * Custom hook for defining a user form.
 *
 * @returns An object containing the form, form methods, and other related values.
 */
export const useDefineUserForm = () => {
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
    formState: { isSubmitting, isDirty },
  } = form;

  // Fetch user data when rowId changes
  useEffect(() => {
    // Get users data from query client
    const usersData = queryClient.getQueryData<{
      data: UsersTableDto[];
    }>(DATA_QUERY_KEY);

    // Get user data by id
    const userData = usersData?.data.find((item) => item.id === rowId);

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
      lockoutEnd: userData?.lockoutEnd
        ? new Date(userData?.lockoutEnd)
        : undefined,
      emailConfirmed: userData?.emailConfirmed ?? false,
      pwdSetOn: userData?.pwdSetOn ? new Date(userData?.pwdSetOn) : undefined,
      createdBy:
        userData?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,
      createdOn: userData?.createdOn
        ? new Date(userData?.createdOn)
        : new Date(),
      lastModifiedBy:
        userData?.lastModifiedBy ??
        userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: userData?.lastModifiedOn
        ? new Date(userData?.lastModifiedOn)
        : new Date(),
    });
  }, [rowId, form, queryClient, userSession]);

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

  // Return form and methods
  return {
    form,
    isSubmitting,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  };
};
