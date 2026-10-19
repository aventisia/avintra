import { SubmitButton } from "@avplatform/ui/buttons";
import { InputField } from "@avplatform/ui/form";
import { Form } from "@avplatform/ui/form";
import { useShallow } from "zustand/react/shallow";
import * as z from "zod";

import { emailProps } from "../../constants/form-field-props";
import { tenantInfoZodSchema } from "../../constants/tenant-info-zod-schema";
import { useDefineGetTenantInfoForm } from "../../hooks/useDefineGetTenantInfoForm";
import { useGetTenantInfoMutation } from "../../hooks/useGetTenantInfoMutation";
import { useLoginStore } from "../../stores/login-store";

export const GetTenantInfoForm = () => {
  // Define form
  const { form, isSubmitting } = useDefineGetTenantInfoForm();

  // Get mutation to get tenant info
  const { getTenantInfoMutation, isInfoPending } = useGetTenantInfoMutation();

  // Break-glass escape for admins when the provider redirect is not usable
  const { loginData, setStepNo } = useLoginStore(
    useShallow((state) => ({
      loginData: state.loginData,
      setStepNo: state.setStepNo,
    })),
  );

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof tenantInfoZodSchema>) => {
    getTenantInfoMutation(formData);
  };

  // Continue with the password step while a provider redirect is pending
  const continueWithPasswordHandler = () => {
    if (loginData) setStepNo(2);
  };

  // Return form
  return (
    <>
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

      {loginData && (
        <button
          type="button"
          onClick={continueWithPasswordHandler}
          className="mt-4 w-full text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Continue with password instead (admins)
        </button>
      )}
    </>
  );
};
