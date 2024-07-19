import {
  DialogContent,
  DialogDefaultHeader,
  Form,
  FormField,
  ScrollArea,
  Button,
  RadioGroupItem,
  RadioGroup,
  FormControl,
  Tooltip,
  FormItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
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
  FormLabelExt,
} from "@/react-toolkit/components/form";
import {
  CalendarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/react-toolkit/lib";
import { format } from "date-fns";

/**
 * Renders the dialog content for creating or updating a tenant.
 *
 * @returns The JSX element representing the dialog content.
 */
export const TenantCrudDialogContent = () => {
  // 1. Define tenant form
  const { form, rowId, crudAction, setShowDialog, refineFormData } =
    useDefineTenantForm();

  // const [
  //   isPwdNeverExpiresEnabled,
  //   isIdleSessionTimeoutEnabled,
  //   isSSOEnabled,
  //   dbOption,
  // ] = watch([
  //   "isPwdNeverExpiresEnabled",
  //   "isIdleSessionTimeoutEnabled",
  //   "isSSOEnabled",
  //   "dbOption",
  // ]);

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
    console.log(formData);

    // Create or update the tenant
    mutateTenant({
      id: rowId,
      payload: refineFormData(formData) as unknown as TenantsTableDto,
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
            
            {/* Tenant Id */}
            {crudAction === "read" && (
              <FormField name="id" control={form.control} render={({ field }) => (
                  <InputField field={field} fieldData={{
                    label: "Tenant Id",
                    disabled: true,
                  }} />
                )}
              />
            )}

            {/* Name */}
            <FormField name="name" control={form.control} render={({ field }) => (
                <InputField field={field} fieldData={{
                  label: "Name",
                  disabled: crudAction === "read",
                  isRequired: true,
                }} />
              )}
            />

            
            {/* Expires On */}
            <FormField name="expiresOn" control={form.control} render={({ field }) => (
                <Popover>
                <FormLabelExt fieldData={{label: "Expires On"}} />
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field && "text-muted-foreground"
                    )}
                    disabled={crudAction === "read" || crudAction === "create"}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field ? format(field.value ?? new Date(), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => field.onChange(date)}
                    disabled={crudAction === "read"}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              )}
            />

            {/* Is Password Enabled */}
            <FormField name="isPwdEnabled" control={form.control} render={({ field }) => (
                <SwitchField field={field} fieldData={{
                  label: "Disable Password Login",
                  description: "If disabled, users cannot log in using their password",
                  disabled: crudAction === "read" || crudAction === "create",
                }} />
              )}
            />

            {/* Is Two Factor Authentication Enabled */}
            <FormField name="isTwoFAEnabled" control={form.control} render={({ field }) => (
                <SwitchField field={field} fieldData={{
                  label: "Require Two-Factor Authentication (2FA)",
                  description: "If enabled, all users will need an additional verification step (e.g., one time password via email or code from an authenticator app) to log in, enhancing security",
                  disabled: crudAction === "read" || crudAction === "create",
                }} />
              )}
            />

            {/* Is Password Never Expires Enabled */}
            <FormField name="isPwdNeverExpiresEnabled" control={form.control} render={({ field }) => (
                <SwitchField field={field} fieldData={{
                  label: "Passwords Never Expire",
                  description: "Enabling this removes password expiration",
                  disabled: crudAction === "read" || crudAction === "create",
                }} />
              )}
            />

            {/* Days Before Password Expires */}
            <FormField name="daysBeforePwdExpires" control={form.control} render={({ field }) => (
                <InputField field={field} fieldData={{
                  label: "Days Before Password Expires",
                  disabled: crudAction === "read" || crudAction === "create",
                }} />
              )}
            />

            {/* Is Idle Session Timeout Enabled */}
            <FormField name="isIdleSessionTimeoutEnabled" control={form.control} render={({ field }) => (
                <SwitchField field={field} fieldData={{
                  label: "Enable Idle Session Timeout",
                  description: "If enabled, user sessions will automatically time out after a period of inactivity",
                  disabled: crudAction === "read" || crudAction === "create",
                }}  />
              )}
            />

            {/* Idle Session Timeout Minutes */}
            <FormField name="idleSessionTimeoutMinutes" control={form.control} render={({ field }) => (
                <InputField field={field} fieldData={{
                  label: "Idle Session Timeout (in Minutes)",
                  disabled: crudAction === "read" || crudAction === "create",
                }} />
              )}
            />

            {/* Is SSO Enabled */}
            <FormField name="isSSOEnabled" control={form.control} render={({ field }) => (
                <SwitchField field={field} fieldData={{
                  label: "Enable Single Sign-On (SSO)",
                  description: "If enabled, users can log in using an external authentication provider",
                  disabled: crudAction === "read" || crudAction === "create",
                }} />
              )}
            />

            {/* SSO Config JSON */}
            <FormField name="ssoConfigJson" control={form.control} render={({ field }) => (
                <TextareaField field={field} fieldData={{
                    label: "Single Sign-On (SSO) Configuration",
                    disabled: crudAction === "read" || crudAction === "create",
                    className: "min-h-[12.5rem]"
                }} />
              )}
            />
  
              {/* Database Option */}
                <FormField name="dbOption" control={form.control} render={({ field }) => (
                  <div className="flex flex-col items-start justify-between space-y-2 rounded-lg border p-4">
                    <FormLabelExt fieldData={{label: "Database Options:"}}/>
                    <FormControl>
                      <RadioGroup
                        disabled={crudAction === "read" || crudAction === "create"}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                        >
                        {[
                          {
                            value: "Shared",
                            label: "Shared",
                            description:
                              "Tenants share a common database infrastructure. Suitable for low-resource tenants or those not requiring high isolation",
                          },
                          {
                            value: "Isolated",
                            label: "Isolated",
                            description:
                              "Tenants have their own database schema within a shared infrastructure. Offers a balance between cost and isolation.",
                          },
                          {
                            value: "DedicatedServer",
                            label: "Dedicated Server (Premium)",
                            description:
                              "Tenants have their own dedicated database server. Provides the highest performance and complete isolation, but comes at a higher cost.",
                          },
                        ].map((item, index) => (
                          <FormItem
                            key={index}
                            className="flex items-center gap-1.5 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={item.value} />
                            </FormControl>
                            <p className="ml-1 text-sm font-normal">{item.label}</p>
                            <Tooltip content={item.description}>
                              <InformationCircleIcon className="h-4 w-4" />
                            </Tooltip>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </div>
                  )}
                />

            {/* DB User Id &&  DB Pwd */}
                      <div className="grid grid-cols-2 gap-4">
                          <FormField name="dbUserId" control={form.control} render={({ field }) => (
                            <InputField field={field} fieldData={{
                              label: "User Id",
                              description: "Enter a username of the dedicated account to access the database.",
                              disabled: crudAction === "read" || crudAction === "create",
                              className: "w-full"
                            }} />
                          )}
                          />

                          <FormField name="dbPwd" control={form.control} render={({ field }) => (
                              <InputField field={field} fieldData={{
                                label: "Password",
                                description: "Enter a password of the dedicated account to access the database.",
                                disabled: crudAction === "read" || crudAction === "create",
                                className: "w-full"
                              }} />
                            )}
                          />
                      </div>
            
            {/* DB Host &&  DB Port */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField name="dbHost" control={form.control} render={({ field }) => (
                        <InputField field={field} fieldData={{
                          label: "Host",
                          description: "Enter the hostname or IP address of the dedicated database server. This is where the application will connect to the database",
                          disabled: crudAction === "read" || crudAction === "create",
                        }} />
                      )}
                    />

                    <FormField name="dbPort" control={form.control} render={({ field }) => (
                        <InputField field={field} fieldData={{
                          label: "Port",
                          description: "Enter the port number on which the dedicated database server listens for connections. This is typically the default port for your chosen database management system (e.g., 5432 for PostgreSQL)",
                          disabled: crudAction === "read" || crudAction === "create",
                          className: "flex-1"
                        }} />
                      )}
                    />
                </div>

            {/* DB Name Prefix */}
                <FormField name="dbNamePrefix" control={form.control} render={({ field }) => (
                    <InputField field={field} fieldData={{
                      label: "Database Name Prefix",
                      description: "Add a specific prefix for your database. This option allows you to customize the schema name for better organization and identification",
                      disabled: crudAction === "read" || crudAction === "create",
                    }} />
                  )}
                />
            
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

            {/* AutherCard */}
            {crudAction === "read" && (
              <AutherCard
                createdBy={form.getValues("createdBy")} createdOn={form.getValues("createdOn")}
                lastModifiedBy={form.getValues("lastModifiedBy")} lastModifiedOn={form.getValues("lastModifiedOn")}/>
            )}

            {/* Submit button */}
            {crudAction !== "read" && (
              <div className="!mt-5 flex w-full justify-end">
                <Button onClick={() => console.log(form)
                } type="submit" className="min-w-[5rem]">
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
