import { useForm } from "react-hook-form";
import { z } from "zod";
import { userZodSchema } from "../constants/user-zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UsersTableDto } from "../dtos/users-table-dto";
import { DATA_QUERY_KEY } from "../constants/constants";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserSessionStore } from "@/react-toolkit/stores";
import { useDTCrudDialogStore } from "@/react-toolkit/components/data-table";

/**
 * Custom hook for defining a user form.
 *
 * @returns An object containing the form, form methods, and other related values.
 */
export const useDefineUserForm = () => {
  // 1. Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // 2. Get store state and actions
  const {
    crudDialogOptions: { rowId, crudAction },
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
    })),
  );

  // 3. Get query client
  const queryClient = useQueryClient();

  // 4. Define form with zod schema
  const form = useForm<z.infer<typeof userZodSchema>>({
    resolver: zodResolver(userZodSchema),
  });

  // 5. Desctructure form's methods
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // 6. Fetch user data when rowId changes
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
      twoFactorEnabled: userData?.twoFactorEnabled ?? false,
      userRoles: userData?.userRoles ?? [],
      isDisabled: userData?.isDisabled ?? false,
      // Read (view) only fields
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

  // 7. Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof userZodSchema>) => {
    return {
      ...formData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  // 8. Return form and methods
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
