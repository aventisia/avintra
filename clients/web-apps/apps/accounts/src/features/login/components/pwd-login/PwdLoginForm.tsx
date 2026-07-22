import { SubmitButton } from "@avplatform/ui/buttons";
import { InputField } from "@avplatform/ui/form";
import { Form } from "@avplatform/ui/form";
import { toast } from "@avplatform/ui/sonner";
import * as z from "zod";

import { pwdProps } from "../../constants/form-field-props";
import { pwdLoginZodSchema } from "../../constants/pwd-login-zod-schema";
import type { PwdLoginDto } from "../../dtos/pwd-login-dto";
import { useAuthenticateUserMutation } from "../../hooks/useAuthenticateUserMutation";
import { useDefinePwdLoginForm } from "../../hooks/useDefinePwdLoginForm";

export const PwdLoginForm = () => {
  // Define form
  const { form, isSubmitting, loginData, setLoginData, resetLoginProcess } =
    useDefinePwdLoginForm();

  // Get mutation
  const { authenticateUserMutation, isAuthPending } = useAuthenticateUserMutation();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof pwdLoginZodSchema>) => {
    // store data is null
    if (!loginData) {
      toast.error("Something went wrong. Please try again.");
      resetLoginProcess();
      return;
    }

    // Stash login data to resend 2FA code
    setLoginData({
      tenantId: loginData.tenantId,
      email: loginData.email,
      pwd: formData.pwd,
    });

    // Payload
    const payload: PwdLoginDto = {
      email: loginData.email,
      pwd: formData.pwd,
    };

    // Try to Authenticate user
    authenticateUserMutation(payload);
  };

  // Return form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isAuthPending}
      checkDirtyForm={false}
    >
      {/* Password */}
      <InputField {...pwdProps} />

      {/* Submit form */}
      <SubmitButton
        className="!mt-5 h-11 w-full text-md"
        primaryText="Login"
        isPending={isSubmitting || isAuthPending}
      />
    </Form>
  );
};
