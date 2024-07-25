import {
  emailProps,
  tenantInfoZodSchema,
  useDefineGetTenantInfoForm,
  useGetTenantInfoMutation,
} from "@/features/login";
import * as z from "zod";
import { SubmitButton } from "@/react-toolkit/components/ui";
import { Form, InputField } from "@/react-toolkit/components/form";

export const GetTenantInfoForm = () => {
  // Define form
  const { form, isSubmitting } = useDefineGetTenantInfoForm();

  // Get mutation to get tenant info
  const { getTenantInfoMutation, isInfoPending } = useGetTenantInfoMutation();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof tenantInfoZodSchema>) => {
    getTenantInfoMutation(formData);
  };

  // Return form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <fieldset
          disabled={isSubmitting || isInfoPending}
          className="w-full space-y-3.5"
        >
          {/* Email */}
          <InputField {...emailProps} />

          {/* Submit form */}
          <SubmitButton
            className="!mt-5 w-full"
            primaryText="Continue"
            isPending={isSubmitting || isInfoPending}
          />
        </fieldset>
      </form>
    </Form>
  );
};
