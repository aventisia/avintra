import { Button } from "@aventisia/ui/buttons";
import { AutherCard, Form, InputField, SwitchField } from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { z } from "zod";

import { MultiSelectField } from "@/components/multi-select/MultiSelectField";

import { userOptimisticMutationFn } from "../../apis/users-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  emailConfirmedProps,
  emailProps,
  firstNameProps,
  idProps,
  isDisabledProps,
  lastNameProps,
  lockoutEndProps,
  pwdSetOnProps,
  twoFactorEnabledProps,
  userRolesProps,
} from "../../constants/user-form-field-props";
import { userZodSchema } from "../../constants/user-zod-schema";
import { UsersTableDto } from "../../dtos/users-table-dto";
import { useDefineUserForm } from "../../hooks/useDefineUserForm";
import { useFetchUserRoles } from "../../hooks/useFetchUserRoles";

import { UnlockAccountField } from "./UnlockAccountField";

export const UserCrudForm = () => {
  // Fetch user roles to populate the user roles multi-selector
  const { data: userRoles } = useFetchUserRoles();

  // Define user form
  const {
    form,
    isDirty,
    rowId,
    crudAction,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
    setShowDialog,
    refineFormData,
  } = useDefineUserForm();

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
    setShowDialog(false);
  };

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* User Id (Read-only) */}
      {isReadMode && <InputField {...idProps} />}

      {/* First Name */}
      <InputField {...firstNameProps} />

      {/* Last Name */}
      <InputField {...lastNameProps} />

      {/* Email */}
      <InputField
        {...emailProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      {/* User Roles */}
      <MultiSelectField
        {...userRolesProps}
        selectOptions={userRoles?.data || []}
      />

      {/* Two Factor Enabled */}
      <SwitchField {...twoFactorEnabledProps} />

      {/* Unlock account (Custom users-table component) */}
      <UnlockAccountField crudAction={crudAction} form={form} />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* Read-only Fields */}
      {isReadMode && (
        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-4">
            {/* Lockout End */}
            <InputField {...lockoutEndProps} />

            {/* Email Confirmed */}
            <InputField {...emailConfirmedProps} />
          </div>

          {/* Pwd Set On */}
          <InputField {...pwdSetOnProps} />
        </div>
      )}

      {/* AutherCard */}
      {isReadMode && (
        <AutherCard
          createdBy={form.getValues("createdBy")}
          createdOn={form.getValues("createdOn")}
          lastModifiedBy={form.getValues("lastModifiedBy")}
          lastModifiedOn={form.getValues("lastModifiedOn")}
        />
      )}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <Button
            type="submit"
            disabled={!isDirty || !isAvailable || isCheckPending}
            className="min-w-[5rem]"
          >
            {crudAction === "create" ? "Create user" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
