import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { isRoleNameAvailable } from "../apis/roles-table-apis";
import { AccessType, PERMISSIONS } from "../constants/permissions-and-acesses";
import { addRoleFormZodSchema, roleNameSchema } from "../constants/role-zod-schema";
import { useFetchRoleById } from "./useFetchRoleById";

interface UseDefineRoleFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

export const useDefineRoleForm = ({ rowId, crudAction }: UseDefineRoleFormOptions) => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { setIsDirty, onCloseConfirmed } = useCrudDialogDirty();

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
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Reset availability message when component unmounts
  useEffect(() => {
    return () => {
      setAvailabilityMessage(null);
    };
  }, [setAvailabilityMessage]);

  return {
    form,
    isSubmitting,
    isDirty,
    data,
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
    setValue,
    errors,
    onCloseConfirmed,
  };
};
