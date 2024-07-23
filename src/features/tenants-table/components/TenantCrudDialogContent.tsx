import {
  DialogContent,
  DialogDefaultHeader,
  Form,
  ScrollArea,
  Button,
} from "@/react-toolkit/components/ui";
import { useDefineTenantForm } from "../hooks/useDefineTenantForm";
import { useListOptimisticMutation } from "@/react-toolkit/hooks";
import {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
} from "../constants/constants";
import { tenantOptimisticMutationFn } from "../apis/tenants-table-apis";
import { TenantsTableDto } from "../dtos/tenants-table-dto";
import { z } from "zod";
import { tenantZodSchema } from "../constants/tenant-zod-schema";
import {
  InputField,
  AutherCard,
  SwitchField,
  TextareaField,
  RadioGroupField,
  DatePickerField,
} from "@/react-toolkit/components/form";
import * as fieldProps from "@/features/tenants-table";
import { DatabaseOptionsEnum } from "@/react-toolkit/enums";

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
            {isReadMode && <InputField {...fieldProps.idProps} />}

            {/* Name */}
            <InputField {...fieldProps.nameProps} disabled={isReadMode} />

            {/* Expires On */}
            <DatePickerField
              {...fieldProps.expiresOnProps}
              disabled={isReadMode}
            />

            {/* Is TwoFA Enabled*/}
            <SwitchField
              {...fieldProps.isTwoFAEnabledProps}
              disabled={isReadMode}
            />

            {/* Is Password Enabled */}
            <SwitchField
              {...fieldProps.isPwdEnabledProps}
              disabled={isReadMode}
            />

            {/* Is SSO Enabled */}
            <SwitchField
              {...fieldProps.isSSOEnabledProps}
              disabled={isReadMode}
            />

            {/* SSO Config JSON */}
            {isSSOEnabled && (
              <TextareaField
                {...fieldProps.ssoConfigJsonProps}
                disabled={isReadMode}
                isRequired={isSSOEnabled}
              />
            )}

            {/* Is Password Never Expires Enabled */}
            <SwitchField
              {...fieldProps.isPwdNeverExpiresEnabledProps}
              disabled={isReadMode}
            />

            {/* Days Before Password Expires */}
            {!isPwdNeverExpiresEnabled && (
              <InputField
                {...fieldProps.daysBeforePwdExpiresProps}
                disabled={isReadMode}
                isRequired={!isPwdNeverExpiresEnabled}
              />
            )}

            {/* Is Idle Session Timeout Enabled */}
            <SwitchField
              {...fieldProps.isIdleSessionTimeoutEnabledProps}
              disabled={isReadMode}
            />

            {/* Idle Session Timeout Minutes */}
            {isIdleSessionTimeoutEnabled && (
              <InputField
                {...fieldProps.idleSessionTimeoutMinutesProps}
                disabled={isReadMode}
                isRequired={isIdleSessionTimeoutEnabled}
              />
            )}

            {/* Database Option */}
            <RadioGroupField
              {...fieldProps.dbOptionProps}
              disabled={isReadMode}
            />

            {/* Database Name Prefix */}
            {dbOption !== DatabaseOptionsEnum.Shared && (
              <>
                <InputField
                  {...fieldProps.dbNamePrefixProps}
                  disabled={isReadMode}
                />
                <div className="flex flex-col gap-3.5">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Database User Id */}
                    <InputField
                      {...fieldProps.dbUserIdProps}
                      disabled={isReadMode}
                    />

                    {/* Database Password */}
                    <InputField
                      {...fieldProps.dbPwdProps}
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
                    {...fieldProps.dbHostProps}
                    disabled={isReadMode}
                  />

                  {/* Database Port */}
                  <InputField
                    className="w-24"
                    {...fieldProps.dbPortProps}
                    disabled={isReadMode}
                  />
                </div>
              </div>
            )}

            {/* Is Disabled */}
            {crudAction !== "create" && (
              <SwitchField
                {...fieldProps.isDisabledProps}
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
