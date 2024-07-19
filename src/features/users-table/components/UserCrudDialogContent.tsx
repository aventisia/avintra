import {
  DialogContent,
  DialogDefaultHeader,
  Form,
  FormField,
  ScrollArea,
  Button,
  MultiSelector,
  FormControl,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
  Tooltip,
} from "@/react-toolkit/components/ui";
import { useDefineUserForm } from "../hooks/useDefineUserForm";
import { useListOptimisticMutation } from "@/react-toolkit/hooks";
import {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
} from "../constants/constants";
import { userOptimisticMutationFn } from "../apis/users-table-apis";
import { UsersTableDto } from "../dtos/users-table-dto";
import { z } from "zod";
import { userZodSchema } from "../constants/user-zod-schema";
import {
  InputField,
  AutherCard,
  SwitchField,
  FormLabelExt,
} from "@/react-toolkit/components/form";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useFetchUserRoles } from "../hooks/useFetchUserRoles";

/**
 * Renders the dialog content for creating or updating a user.
 *
 * @returns The JSX element representing the dialog content.
 */
export const UserCrudDialogContent = () => {
  // 1. Define user form
  const { form, rowId, crudAction, setShowDialog, refineFormData } =
    useDefineUserForm();

  // Get user roles data
  const { data } = useFetchUserRoles();

  //console.log("User roles:", data?.data);

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
              
              {/* User Id */}
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
  
              {/* User Roles */}
              <FormField name="userRoles" control={form.control} render={({ field }) => (
                    <MultiSelector onValuesChange={field.onChange} values={field.value}>
                      <FormLabelExt fieldData={{ label: "Roles" }} />
                      <FormControl>
                        <MultiSelectorTrigger disabled={crudAction === "read"}>
                          <MultiSelectorInput
                            disabled={crudAction === "read"}
                            placeholder="Select roles"
                          />
                        </MultiSelectorTrigger>
                      </FormControl>
                      {data?.data?.length !== field.value.length && (
                        <MultiSelectorContent>
                          <MultiSelectorList>
                            {data?.data
                              ?.filter((option) => !field.value.includes(option.value))
                              .map((item, index) => (
                                <MultiSelectorItem key={index} value={item.value}>
                                  <div className="flex items-center gap-2">
                                    {item.label}
                                    {item.description && (
                                      <Tooltip content={item.description}>
                                        <InformationCircleIcon className="h-4 w-4" />
                                      </Tooltip>
                                    )}
                                  </div>
                                </MultiSelectorItem>
                              ))}
                          </MultiSelectorList>
                        </MultiSelectorContent>
                      )}
                    </MultiSelector>
                )} />
  
  
              {/* Email */} 
              <FormField name="email" control={form.control} render={({ field }) => (
                  <InputField field={field} fieldData={{
                    label: "Email",
                    disabled: crudAction === "read",
                    isRequired: true,
                  }} />
                )}
              />
                
              {/* Two Factor Enabled */}
              <FormField name="twoFactorEnabled" control={form.control} render={({ field }) => (
                  <SwitchField field={field} fieldData={{
                    label: "Two Factor Enabled",
                    description: "Enable two-factor authentication for this user",
                    disabled: crudAction === "read",
                    isRequired: true,
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
