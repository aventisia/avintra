import { Button } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, FormLabelExt, FormMessage, InputField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect, useState } from "react";
import { z } from "zod";

import { roleOptimisticMutationFn } from "../../apis/roles-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  roleDescriptionProps,
  roleNameProps,
  rolePermissionsProps,
} from "../../constants/role-form-field-props.constant";
import { RolePermission, addRoleFormZodSchema } from "../../constants/role-zod-schema";
import { RoleTableDTO } from "../../dtos/roles-table-dto";
import { useDefineRoleForm } from "../../hooks/useDefineRoleForm";
import PermissionsGrid from "./PermissionsGird";

interface RoleCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const RoleCrudForm = ({ rowId, crudAction }: RoleCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  const {
    form,
    isSubmitting,
    data,
    availabilityMessage,
    handleInputChange,
    isAvailable,
    isCheckPending,
    setAvailabilityMessage,
    setValue,
    isDirty,
    errors,
  } = useDefineRoleForm({ rowId, crudAction });

  const [rolePermissions, setRolePermissions] = useState(data?.data.rolePermissions);

  useEffect(() => {
    setRolePermissions(data?.data.rolePermissions || []);
  }, [data?.data.rolePermissions]);

  const handlePermissionsChange = (updatedPermissions: RolePermission[]) => {
    setRolePermissions(updatedPermissions);
    setValue("rolePermissions", updatedPermissions, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Define optimistic mutation to crete or update the document
  const { mutate: mutateRole } = useListOptimisticMutation<
    RoleTableDTO,
    RoleTableDTO | boolean,
    RoleTableDTO
  >([rowId], roleOptimisticMutationFn, DATA_QUERY_KEY);

  // Handle form submit
  const onSubmit = (formData: z.infer<typeof addRoleFormZodSchema>) => {
    mutateRole({
      payload: formData as unknown as RoleTableDTO,
      crudAction: crudAction,
    });

    setAvailabilityMessage(null);

    onCloseConfirmed();
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting}
      recordName={form.watch("fullName") ?? ""}
    >
      <InputField
        {...roleNameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
        autoFocus
      />
      <TextareaField {...roleDescriptionProps} />
      <div>
        <FormLabelExt {...rolePermissionsProps} />
        <div className="mt-1.5">
          <PermissionsGrid
            initialData={rolePermissions}
            onPermissionsChange={handlePermissionsChange}
          />
        </div>
        {errors.rolePermissions && (
          <FormMessage customMessageType={"Red"} size={"base"}>
            {errors.rolePermissions.message}
          </FormMessage>
        )}
      </div>
      <CrudDialogActions>
        <Button type="submit" disabled={!isDirty || isSubmitting || !isAvailable || isCheckPending}>
          {crudAction === "create" ? "Create role" : "Save changes"}
        </Button>
      </CrudDialogActions>
    </Form>
  );
};
