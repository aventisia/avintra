import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { isEmailAvailable } from "@/react-toolkit/apis/accounts-auth-apis";
import { useCheckAvailability } from "@/react-toolkit/hooks/useCheckAvailability";
import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useRoleSessionStore } from "@/react-toolkit/stores/role-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { DATA_QUERY_KEY } from "../constants";
import { roleEmailSchema, roleZodSchema } from "../constants/role-zod-schema";
import { RolesTableDto } from "../dtos/roles-table-dto";

/**
 * Custom hook for defining a role form.
 */
export const useDefineRoleForm = () => {
  // Set role email state (required for avaialbility check)
  const [roleEmail, setRoleEmail] = useState("");

  // Get role session
  const { roleSession } = useRoleSessionStore(
    useShallow((state) => ({
      roleSession: state.roleSession,
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
  const form = useForm<z.infer<typeof roleZodSchema>>({
    resolver: zodResolver(roleZodSchema),
    defaultValues: {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      roleRoles: [],
      twoFactorEnabled: false,
      isDisabled: false,
      unlockAccount: false,
      lockoutEnd: undefined,
      emailConfirmed: false,
      pwdSetOn: undefined,
      createdBy: roleSession?.firstName + " " + roleSession?.lastName,
      createdOn: new Date(),
      lastModifiedBy: roleSession?.firstName + " " + roleSession?.lastName,
      lastModifiedOn: new Date(),
    },
  });

  // Desctructure form's methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch role data when rowId changes
  useEffect(() => {
    // Get roles data from query client
    const rolesData = queryClient.getQueryData<{
      data: RolesTableDto[];
    }>(DATA_QUERY_KEY);

    // Get role data by id
    const roleData = rolesData?.data.find((item) => item.id === rowId);

    // Set role email
    setRoleEmail(roleData?.email ?? "");

    // Set role data to form
    form.reset({
      id: rowId,
      firstName: roleData?.firstName ?? "",
      lastName: roleData?.lastName ?? "",
      email: roleData?.email ?? "",
      roleRoles: roleData?.roleRoles ?? [],
      twoFactorEnabled: roleData?.twoFactorEnabled ?? false,
      isDisabled: roleData?.isDisabled ?? false,
      unlockAccount: false, // Field Should be visible only if unlock account is required
      // Read (view) only fields
      lockoutEnd: roleData?.lockoutEnd
        ? new Date(roleData?.lockoutEnd)
        : undefined,
      emailConfirmed: roleData?.emailConfirmed ?? false,
      pwdSetOn: roleData?.pwdSetOn ? new Date(roleData?.pwdSetOn) : undefined,
      createdBy:
        roleData?.createdBy ??
        roleSession?.firstName + " " + roleSession?.lastName,
      createdOn: roleData?.createdOn
        ? new Date(roleData?.createdOn)
        : new Date(),
      lastModifiedBy:
        roleData?.lastModifiedBy ??
        roleSession?.firstName + " " + roleSession?.lastName,
      lastModifiedOn: roleData?.lastModifiedOn
        ? new Date(roleData?.lastModifiedOn)
        : new Date(),
    });
  }, [rowId, form, queryClient, roleSession]);

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof roleZodSchema>, z.ZodString>({
    defaultInputValue: roleEmail,
    fieldName: "email",
    form,
    fieldSchema: roleEmailSchema,
    checkAvailabilityAPIFn: isEmailAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof roleZodSchema>) => {
    return {
      ...formData,
      lastModifiedBy: roleSession?.email ?? "",
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
