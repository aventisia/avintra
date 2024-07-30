import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { Form } from "@/react-toolkit/ui/form/Form";
import * as z from "zod";
import { emailProps } from "../../constants/form-field-props";
import { tenantInfoZodSchema } from "../../constants/tenant-info-zod-schema";
import { useDefineGetTenantInfoForm } from "../../hooks/useDefineGetTenantInfoForm";
import { useGetTenantInfoMutation } from "../../hooks/useGetTenantInfoMutation";

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
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isInfoPending}
    >
      {/* Email */}
      <InputField {...emailProps} />

      {/* Submit form */}
      <SubmitButton
        className="!mt-5 w-full"
        primaryText="Continue"
        isPending={isSubmitting || isInfoPending}
      />
    </Form>
  );
};
