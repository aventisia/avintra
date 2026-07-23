import { Button } from "@avplatform/ui/buttons";
import { Form, FormMessage, InputField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { useEffect, useState } from "react";
import { z } from "zod";

import { roleOptimisticMutationFn } from "../../apis/roles-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  idProps,
  roleDescriptionProps,
  roleNameProps,
} from "../../constants/role-form-field-props";
import { RolePermission, addRoleFormZodSchema } from "../../constants/role-zod-schema";
import { RoleTableDTO } from "../../dtos/roles-table-dto";
import { useDefineRoleForm } from "../../hooks/useDefineRoleForm";
import PermissionsGrid from "./PermissionsGird";

const RoleCrudForm = () => {
  const {
    form,
    isSubmitting,
    rowId,
    crudAction,
    setShowDialog,
    data,
    availabilityMessage,
    handleInputChange,
    isAvailable,
    isCheckPending,
    setAvailabilityMessage,
    setValue,
    isDirty,
    errors,
  } = useDefineRoleForm();

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

    setShowDialog(false);
  };

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isReadMode}
      className="px-2.5 pb-5"
    >
      {isReadMode && <InputField {...idProps} />}
      <InputField
        {...roleNameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
        disabled={isReadMode}
      />
      <TextareaField {...roleDescriptionProps} />

      <PermissionsGrid
        initialData={rolePermissions}
        onPermissionsChange={handlePermissionsChange}
      />
      {errors.rolePermissions && (
        <FormMessage customMessageType={"Red"} size={"base"}>
          {errors.rolePermissions.message}
        </FormMessage>
      )}
      <div className="!mt-5 flex justify-end">
        {!isReadMode && (
          <Button
            type="submit"
            className="min-w-[8rem] text-base font-medium"
            disabled={!isDirty || isSubmitting || !isAvailable || isCheckPending}
          >
            {crudAction === "create" ? "Submit" : "Save"}
          </Button>
        )}
      </div>
    </Form>
  );
};

export default RoleCrudForm;
