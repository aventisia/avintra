import {
  pwdProps,
  useDefinePwdLoginForm,
  useAuthenticateUserMutation,
  pwdLoginZodSchema,
} from "@/features/login";
import * as z from "zod";
import { SubmitButton } from "@/react-toolkit/components/ui";
import { Form, InputField } from "@/react-toolkit/components/form";
import { toast } from "sonner";

export const PwdLoginForm = () => {
  // Define form
  const { form, isSubmitting, loginData, setLoginData, resetLoginProcess } =
    useDefinePwdLoginForm();

  // Get mutation
  const { authenticateUserMutation, isAuthPending } =
    useAuthenticateUserMutation();

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

    // Try to Authenticate user
    authenticateUserMutation({
      email: loginData.email,
      pwd: formData.pwd,
    });
  };

  // Return form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <fieldset
          disabled={isSubmitting || isAuthPending}
          className="w-full space-y-3.5"
        >
          {/* Password */}
          <InputField {...pwdProps} />

          {/* Submit form */}
          <SubmitButton
            className="!mt-5 w-full"
            primaryText="Login"
            isPending={isSubmitting || isAuthPending}
          />
        </fieldset>
      </form>
    </Form>
  );
};
