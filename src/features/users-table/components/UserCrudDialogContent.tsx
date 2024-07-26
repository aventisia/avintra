import { InputField } from "@/react-toolkit/form/components/fields/InputField";
import { MultiSelectField } from "@/react-toolkit/form/components/fields/MultiSelectField";
import { SwitchField } from "@/react-toolkit/form/components/fields/SwitchField";
import { Form } from "@/react-toolkit/form/components/form/Form";
import { AutherCard } from "@/react-toolkit/form/components/non-field/AutherCard";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import {
  DialogContent,
  DialogDefaultHeader,
} from "@/react-toolkit/ui/dialog/Dialog";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { z } from "zod";
import { userOptimisticMutationFn } from "../apis/users-table-apis";
import {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
} from "../constants/constants";
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
} from "../constants/user-form-field-props";
import { userZodSchema } from "../constants/user-zod-schema";
import { UsersTableDto } from "../dtos/users-table-dto";
import { useDefineUserForm } from "../hooks/useDefineUserForm";
import { useFetchUserRoles } from "../hooks/useFetchUserRoles";
import { UnlockAccountField } from "./UnlockAccountField";

/**
 * Renders the dialog content for creating or updating a user.
 *
 * @returns The JSX element representing the dialog content.
 */
export const UserCrudDialogContent = () => {
  // 0. Fetch user roles to populate the user roles multi-selector
  const { data } = useFetchUserRoles();

  // 1. Define user form
  const { form, rowId, crudAction, setShowDialog, refineFormData } =
    useDefineUserForm();

  // 2. Define optimistic mutation to crete or update the user
  const { mutate: mutateUser } = useListOptimisticMutation<
    UsersTableDto,
    UsersTableDto | boolean,
    UsersTableDto
  >(userOptimisticMutationFn, DATA_QUERY_KEY);

  // 3. Get dialog heading and description
  const dialogHeaderOptions = getDialogHeadingDescription(crudAction);

  // 4. Define submit handler
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
    <DialogContent side={"right"} className="!max-w-[32rem]">
      <DialogDefaultHeader
        className="px-3.5 py-3 text-lg tracking-wide"
        heading={dialogHeaderOptions.heading}
        description={dialogHeaderOptions.description}
      />
      <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
        <Form {...form}>
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
              selectOptions={data?.data || []}
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
                <Button type="submit" className="min-w-[5rem]">
                  {crudAction === "create" ? "Create user" : "Save changes"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </ScrollArea>
    </DialogContent>
  );
};
