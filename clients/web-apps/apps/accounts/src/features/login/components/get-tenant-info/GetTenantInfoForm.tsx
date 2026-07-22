import { SubmitButton } from "@avplatform/ui/buttons";
import { InputField } from "@avplatform/ui/form";
import { Form } from "@avplatform/ui/form";
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
      checkDirtyForm={false}
    >
      {/* Email */}
      <InputField {...emailProps} />

      {/* Submit form */}
      <SubmitButton
        className="text-md !mt-5 h-11 w-full"
        primaryText="Continue"
        isPending={isSubmitting || isInfoPending}
      />
    </Form>
  );
};
