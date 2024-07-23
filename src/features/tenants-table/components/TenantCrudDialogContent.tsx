import {
  useDefineTenantForm,
  TenantsTableDto,
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  tenantOptimisticMutationFn,
  tenantZodSchema,
  idProps,
  nameProps,
  expiresOnProps,
  isTwoFAEnabledProps,
  isPwdEnabledProps,
  isSSOEnabledProps,
  ssoConfigJsonProps,
  isPwdNeverExpiresEnabledProps,
  daysBeforePwdExpiresProps,
  isIdleSessionTimeoutEnabledProps,
  idleSessionTimeoutMinutesProps,
  dbOptionProps,
  dbNamePrefixProps,
  dbUserIdProps,
  dbPwdProps,
  dbHostProps,
  dbPortProps,
  isDisabledProps,
} from "@/features/tenants-table";
import { z } from "zod";
import { useListOptimisticMutation } from "@/react-toolkit/hooks";
import { DatabaseOptionsEnum } from "@/react-toolkit/enums";
import {
  DialogContent,
  DialogDefaultHeader,
  Form,
  ScrollArea,
  Button,
} from "@/react-toolkit/components/ui";
import {
  InputField,
  AutherCard,
  SwitchField,
  TextareaField,
  RadioGroupField,
  DatePickerField,
} from "@/react-toolkit/components/form";

/**
 * Renders the dialog content for creating or updating a tenant.
 *
 * @returns The JSX element representing the dialog content.
 */
export const TenantCrudDialogContent = () => {
  // 1. Define tenant form
  const { form, watch, rowId, crudAction, setShowDialog, refineFormData } =
    useDefineTenantForm();

  // 2. Define optimistic mutation to crete or update the tenant
  const { mutate: mutateTenant } = useListOptimisticMutation<
    TenantsTableDto,
    TenantsTableDto | boolean,
    TenantsTableDto
  >(tenantOptimisticMutationFn, DATA_QUERY_KEY);

  // 3. Get dialog heading and description
  const dialogHeaderOptions = getDialogHeadingDescription(crudAction);

  // 4. Define submit handler
  const onSubmit = (formData: z.infer<typeof tenantZodSchema>) => {
    // Create or update the tenant
    mutateTenant({
      id: rowId,
      payload: refineFormData(formData) as unknown as TenantsTableDto,
      crudAction: crudAction,
    });

    // Close the dialog
    setShowDialog(false);
  };

  // Watch form fields
  const [
    isSSOEnabled,
    isPwdNeverExpiresEnabled,
    isIdleSessionTimeoutEnabled,
    dbOption,
  ] = watch([
    "isSSOEnabled",
    "isPwdNeverExpiresEnabled",
    "isIdleSessionTimeoutEnabled",
    "dbOption",
  ]);

  // Is form in read mode
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <DialogContent side={"right"} className="!max-w-[40rem]">
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
            {/* Tenant Id */}
            {isReadMode && <InputField {...idProps} />}

            {/* Name */}
            <InputField {...nameProps} disabled={isReadMode} />

            {/* Expires On */}
            <DatePickerField
              {...expiresOnProps}
              disabled={isReadMode}
            />

            {/* Is TwoFA Enabled*/}
            <SwitchField
              {...isTwoFAEnabledProps}
              disabled={isReadMode}
            />

            {/* Is Password Enabled */}
            <SwitchField
              {...isPwdEnabledProps}
              disabled={isReadMode}
            />

            {/* Is SSO Enabled */}
            <SwitchField
              {...isSSOEnabledProps}
              disabled={isReadMode}
            />

            {/* SSO Config JSON */}
            {isSSOEnabled && (
              <TextareaField
                {...ssoConfigJsonProps}
                disabled={isReadMode}
                isRequired={isSSOEnabled}
              />
            )}

            {/* Is Password Never Expires Enabled */}
            <SwitchField
              {...isPwdNeverExpiresEnabledProps}
              disabled={isReadMode}
            />

            {/* Days Before Password Expires */}
            {!isPwdNeverExpiresEnabled && (
              <InputField
                {...daysBeforePwdExpiresProps}
                disabled={isReadMode}
                isRequired={!isPwdNeverExpiresEnabled}
              />
            )}

            {/* Is Idle Session Timeout Enabled */}
            <SwitchField
              {...isIdleSessionTimeoutEnabledProps}
              disabled={isReadMode}
            />

            {/* Idle Session Timeout Minutes */}
            {isIdleSessionTimeoutEnabled && (
              <InputField
                {...idleSessionTimeoutMinutesProps}
                disabled={isReadMode}
                isRequired={isIdleSessionTimeoutEnabled}
              />
            )}

            {/* Database Option */}
            <RadioGroupField
              {...dbOptionProps}
              disabled={isReadMode}
            />

            {/* Database Name Prefix */}
            {dbOption !== DatabaseOptionsEnum.Shared && (
              <>
                <InputField
                  {...dbNamePrefixProps}
                  disabled={isReadMode}
                />
                <div className="flex flex-col gap-3.5">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Database User Id */}
                    <InputField
                      {...dbUserIdProps}
                      disabled={isReadMode}
                    />

                    {/* Database Password */}
                    <InputField
                      {...dbPwdProps}
                      disabled={isReadMode}
                    />
                  </div>
                </div>
              </>
            )}

            {dbOption === DatabaseOptionsEnum.DedicatedServer && (
              <div className="flex flex-col gap-3.5">
                <div className="grid grid-cols-[1fr_auto] gap-4">
                  {/* Database Host */}
                  <InputField
                    {...dbHostProps}
                    disabled={isReadMode}
                  />

                  {/* Database Port */}
                  <InputField
                    className="w-24"
                    {...dbPortProps}
                    disabled={isReadMode}
                  />
                </div>
              </div>
            )}

            {/* Is Disabled */}
            {crudAction !== "create" && (
              <SwitchField
                {...isDisabledProps}
                disabled={isReadMode}
              />
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
                  {crudAction === "create" ? "Create tenant" : "Save changes"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </ScrollArea>
    </DialogContent>
  );
};
