import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { isRoleNameAvailable } from "../apis/roles-table-apis";
import { AccessType, PERMISSIONS } from "../constants/permissions-and-acesses";
import { addRoleFormZodSchema, roleNameSchema } from "../constants/role-zod-schema";
import { useFetchRoleById } from "./useFetchRoleById";

export const useDefineRoleForm = () => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get data-table crud dialog store state and actions
  const {
    crudDialogOptions: { rowId, crudAction, showDialog },
    toggleFormDirty,
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      isFormDirty: state.isFormDirty,

      setShowDialog: state.setShowDialog,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  const { data } = useFetchRoleById(crudAction == "create" ? "" : rowId);

  // Initial role permissions
  const initialRolePermissions = PERMISSIONS.map((roleType) => ({
    permissionType: roleType,
    accesses: [] as AccessType[],
  }));

  const form = useForm<z.infer<typeof addRoleFormZodSchema>>({
    resolver: zodResolver(addRoleFormZodSchema),
    defaultValues: {
      id: "",
      fullName: "",
      description: "",
      rolePermissions: initialRolePermissions,
    },
  });

  const {
    formState: { isSubmitting, isDirty, errors },
    setValue,
  } = form;

  // Fetch document data when rowId changes
  useEffect(() => {
    // Get document data by id
    const roleData = data?.data;

    // Set document data to form
    form.reset({
      id: rowId,
      fullName: roleData?.fullName ?? "",
      description: roleData?.description ?? "",
      rolePermissions: roleData?.rolePermissions ?? [],
    });
  }, [rowId, form, userSession, data?.data]);
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof addRoleFormZodSchema>, z.ZodString>({
    fieldName: "fullName",
    form,
    fieldSchema: roleNameSchema,
    checkAvailabilityAPIFn: isRoleNameAvailable,
  });

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  useEffect(() => {
    if (!showDialog) setAvailabilityMessage(null);
  }, [setAvailabilityMessage, showDialog]);

  return {
    form,
    isSubmitting,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    data,
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
    setValue,
    errors,
  };
};
