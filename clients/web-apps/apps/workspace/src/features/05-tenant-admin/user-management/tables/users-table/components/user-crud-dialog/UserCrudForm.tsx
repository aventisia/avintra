import { Button } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, InputField, MultiSelectField, SwitchField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect } from "react";
import { z } from "zod";

import { userOptimisticMutationFn } from "../../apis/users-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  emailProps,
  firstNameProps,
  isDisabledProps,
  lastNameProps,
  twoFactorEnabledProps,
  userRolesProps,
  userSpacesProps,
} from "../../constants/user-form-field-props.constant";
import { userZodSchema } from "../../constants/user-zod-schema";
import { UsersTableDto } from "../../dtos/users-table-dto";
import { useDefineUserForm } from "../../hooks/useDefineUserForm";
import { useFetchUserRoles } from "../../hooks/useFetchUserRoles";
import { useFetchUserSpaces } from "../../hooks/useFetchUserSpaces";
import { UnlockAccountField } from "./UnlockAccountField";

interface UserCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const UserCrudForm = ({ rowId, crudAction }: UserCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  // Fetch user roles to populate the user roles multi-selector
  const { data: userRoles } = useFetchUserRoles();

  // Fetch user spaces to populate the spaces multi-selector
  const { data: userSpaces } = useFetchUserSpaces();

  // Define user form
  const {
    form,
    isDirty,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
  } = useDefineUserForm({ rowId, crudAction });

  // Define optimistic mutation to crete or update the user
  const { mutate: mutateUser } = useListOptimisticMutation<
    UsersTableDto,
    UsersTableDto | boolean,
    UsersTableDto
  >([rowId], userOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof userZodSchema>) => {
    // Create or update the user
    mutateUser({
      payload: refineFormData(formData) as unknown as UsersTableDto,
      crudAction: crudAction,
    });

    // Reset the availability message
    setAvailabilityMessage(null);

    // Close the dialog
    onCloseConfirmed();
  };

  // The default "Central" space (if present) must always remain selected and cannot be removed.
  const centralSpace = userSpaces?.data?.find((option) => option.isDefault);

  // Pre-select the Central space by default when creating a new user.
  useEffect(() => {
    if (crudAction === "create" && centralSpace) {
      const current = form.getValues("spaces") || [];
      if (!current.includes(centralSpace.value)) {
        form.setValue("spaces", [centralSpace.value, ...current], { shouldDirty: false });
      }
    }
  }, [crudAction, centralSpace, form]);

  // Enforce that the Central space is always selected and cannot be removed.
  const handleSpacesChange = (value: string[]) => {
    if (!centralSpace) {
      form.setValue("spaces", value, { shouldDirty: true });
      return;
    }
    // Always keep the Central space in the selection.
    const next = value.includes(centralSpace.value) ? value : [centralSpace.value, ...value];
    form.setValue("spaces", next, { shouldDirty: true });
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      recordName={`${form.watch("firstName") ?? ""} ${form.watch("lastName") ?? ""}`.trim()}
    >
      <div className="grid grid-cols-2 gap-3">
        <InputField {...firstNameProps} autoFocus />
        <InputField {...lastNameProps} />
      </div>
      <InputField
        {...emailProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />
      <MultiSelectField {...userRolesProps} selectOptions={userRoles?.data || []} />
      <MultiSelectField
        {...userSpacesProps}
        selectOptions={userSpaces?.data || []}
        onValuesChange={handleSpacesChange}
      />
      <SwitchField {...twoFactorEnabledProps} />
      <UnlockAccountField form={form} />
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}
      <CrudDialogActions>
        <Button type="submit" disabled={!isDirty || !isAvailable || isCheckPending}>
          {crudAction === "create" ? "Create user" : "Save changes"}
        </Button>
      </CrudDialogActions>
    </Form>
  );
};
