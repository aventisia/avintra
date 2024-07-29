import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { MultiSelectField } from "@/react-toolkit/ui/form/fields/MultiSelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { z } from "zod";
import { userOptimisticMutationFn } from "../../apis/users-table-apis";
import { DATA_QUERY_KEY } from "../../constants/constants";
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
  const { form, isDirty, rowId, crudAction, setShowDialog, refineFormData } =
    useDefineUserForm();

  // Define optimistic mutation to crete or update the user
  const { mutate: mutateUser } = useListOptimisticMutation<
    UsersTableDto,
    UsersTableDto | boolean,
    UsersTableDto
  >(userOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof userZodSchema>) => {
    // Create or update the user
    mutateUser({
      id: rowId,
      payload: refineFormData(formData) as unknown as UsersTableDto,
      crudAction: crudAction,
    });

    // Close the dialog
    setShowDialog(false);
  };

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form methods={form}>
      <form
        className="w-full space-y-3.5 px-2.5 pb-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* User Id (Read-only) */}
        {isReadMode && <InputField {...idProps} />}

        {/* First Name */}
        <InputField {...firstNameProps} disabled={isReadMode} />

        {/* Last Name */}
        <InputField {...lastNameProps} disabled={isReadMode} />

        {/* Email */}
        <InputField {...emailProps} disabled={isReadMode} />

        {/* User Roles */}
        <MultiSelectField
          {...userRolesProps}
          selectOptions={userRoles?.data || []}
          disabled={isReadMode}
        />

        {/* Two Factor Enabled */}
        <SwitchField {...twoFactorEnabledProps} disabled={isReadMode} />

        {/* Unlock account (Custom users-table component) */}
        <UnlockAccountField crudAction={crudAction} form={form} />

        {/* Is Disabled */}
        {crudAction !== "create" && (
          <SwitchField {...isDisabledProps} disabled={isReadMode} />
        )}

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
        {crudAction !== "read" && (
          <div className="!mt-5 flex w-full justify-end">
            <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
              {crudAction === "create" ? "Create user" : "Save changes"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
