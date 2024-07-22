import {
  UsersTableDto,
  useDefineUserForm,
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  userOptimisticMutationFn,
  userZodSchema,
  useFetchUserRoles,
  UnlockAccountField,
} from "@/features/users-table";
import {
  DialogContent,
  DialogDefaultHeader,
  Form,
  FormField,
  ScrollArea,
  Button,
} from "@/react-toolkit/components/ui";
import { useListOptimisticMutation } from "@/react-toolkit/hooks";
import { z } from "zod";
import {
  InputField,
  AutherCard,
  SwitchField,
  MultiSelectorField,
} from "@/react-toolkit/components/form";

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

  // 5. Return the component
  return (
    // prettier-ignore
    <DialogContent side={"right"} className="!max-w-[32rem]">
      <DialogDefaultHeader
        className="px-3.5 py-3 text-lg tracking-wide"
        heading={dialogHeaderOptions.heading}
        description={dialogHeaderOptions.description}
      />
      <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
        <Form {...form}>
          <form className="w-full space-y-3.5 px-2.5 pb-5" onSubmit={form.handleSubmit(onSubmit)}>
            
            {/* User Id (Read-only) */}
            {crudAction === "read" && (
              <FormField name="id" control={form.control} render={({ field }) => (
                  <InputField field={field} fieldData={{
                    label: "User Id",
                    disabled: true,
                  }} />
                )}
              />
            )}
              
            {/* First Name */}
            <FormField name="firstName" control={form.control} render={({ field }) => (
                <InputField field={field} fieldData={{
                  label: "First Name",
                  disabled: crudAction === "read",
                  isRequired: true,
                }} />
              )}
            />
              
            {/* Last Name */}
            <FormField name="lastName" control={form.control} render={({ field }) => (
                <InputField field={field} fieldData={{
                  label: "Last Name",
                  disabled: crudAction === "read",
                  isRequired: true,
                }} />
              )}
            />
            

            {/* Email */} 
            <FormField name="email" control={form.control} render={({ field }) => (
                <InputField field={field} fieldData={{
                  label: "Email",
                  disabled: crudAction === "read",
                  isRequired: true,
                }} type="email" />
              )}
            />

            {/* User Roles */}
            <MultiSelectorField
              name="userRoles"
              fieldData={{
                label: "Roles",
                disabled: crudAction === "read",
                isRequired: true,
                placeholder: "Select roles",
                selectOptions: data?.data,
              }}
            />
            
            {/* Two Factor Enabled */}
            <FormField name="twoFactorEnabled" control={form.control} render={({ field }) => (
                <SwitchField field={field} fieldData={{
                  label: "Enable Two-Factor Authentication (2FA)",
                  description: "If enabled, user will need an additional verification step (e.g., one time password via email or code from an authenticator app) to log in, enhancing security",
                  disabled: crudAction === "read",
                  isRequired: true,
                }} />
              )}
            />

            {/* Unlock account */}
            <UnlockAccountField crudAction={crudAction} form={form} />
            
            {/* Is Disabled */}
            {crudAction !== "create" && (
              <FormField name="isDisabled" control={form.control} render={({ field }) => (
                  <SwitchField field={field} fieldData={{
                    label: "Disable Record",
                    description: "Disable this record if it's been outdated, or not required anymore",
                    disabled: crudAction === "read",
                  }} />
                )}
              />
            )}

            {/* Read-only Fields */}
            {crudAction === "read" && (
              <div className="flex flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Lockout End */}
                  <FormField name="lockoutEnd" control={form.control} render={({ field }) => (
                      <InputField field={field} fieldData={{
                        label: "Lockout Ends At",
                        disabled: true,
                      }} />
                    )}
                  />

                  {/* Email Confirmed */}
                  <FormField name="emailConfirmed" control={form.control} render={({ field }) => (
                      <InputField field={field} fieldData={{
                        label: "Email Confirmed",
                        disabled: true,
                      }} />
                    )}
                  />
                </div>

                {/* Pwd Set On */}
                <FormField name="pwdSetOn" control={form.control} render={({ field }) => (
                    <InputField field={field} fieldData={{
                      label: "Password Last Set On",
                      disabled: true,
                    }} />
                  )}
                />
              </div>
            )}

            {/* AutherCard */}
            {crudAction === "read" && (
              <AutherCard
                createdBy={form.getValues("createdBy")} createdOn={form.getValues("createdOn")}
                lastModifiedBy={form.getValues("lastModifiedBy")} lastModifiedOn={form.getValues("lastModifiedOn")}/>
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
