import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { getUserDisplayName } from "@avplatform/ui/utils";
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

interface UseDefineUserFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a user form.
 */
export const useDefineUserForm = ({ rowId, crudAction }: UseDefineUserFormOptions) => {
  // Set user email state (required for avaialbility check)
  const [userEmail, setUserEmail] = useState("");

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { setIsDirty } = useCrudDialogDirty();

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
      spaces: [],
      twoFactorEnabled: false,
      isDisabled: false,
      unlockAccount: false,
      lockoutEnd: undefined,
      emailConfirmed: false,
      pwdSetOn: undefined,
      createdBy: getUserDisplayName(userSession),
      createdOn: new Date(),
      lastModifiedBy: getUserDisplayName(userSession),
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
      spaces: userData?.spaces ?? [],
      twoFactorEnabled: userData?.twoFactorEnabled ?? false,
      isDisabled: userData?.isDisabled ?? false,
      unlockAccount: false, // Field Should be visible only if unlock account is required
      // Read (view) only fields
      lockoutEnd: userData?.lockoutEnd ? new Date(userData?.lockoutEnd) : undefined,
      emailConfirmed: userData?.emailConfirmed ?? false,
      pwdSetOn: userData?.pwdSetOn ? new Date(userData?.pwdSetOn) : undefined,
      createdBy: userData?.createdBy ?? getUserDisplayName(userSession),
      createdOn: userData?.createdOn ? new Date(userData?.createdOn) : new Date(),
      lastModifiedBy: userData?.lastModifiedBy ?? getUserDisplayName(userSession),
      lastModifiedOn: userData?.lastModifiedOn ? new Date(userData?.lastModifiedOn) : new Date(),
    });
  }, [rowId, form, queryClient, userSession, crudAction]);

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
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Reset availability message when component unmounts
  useEffect(() => {
    return () => {
      setAvailabilityMessage(null);
    };
  }, [setAvailabilityMessage]);

  // Return form and methods
  return {
    form,
    isDirty,
    refineFormData,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
