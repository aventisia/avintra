import {
  verifyEmailZodSchema,
  useDefineVerifyEmailForm,
  useCreateAccountMutation,
  verificationCodeProps,
} from "@/features/create-account";
import * as z from "zod";
import { SubmitButton } from "@/react-toolkit/components/ui";
import { Form, InputField } from "@/react-toolkit/components/form";
import { toast } from "sonner";

export const VerifyEmailForm = () => {
  // Define form
  const { form, isSubmitting, createAccountData, verifyEmailData, setStepNo } =
    useDefineVerifyEmailForm();

  // Get mutation to create verification code
  const { createAccountMutation, isCreationPending } =
    useCreateAccountMutation();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof verifyEmailZodSchema>) => {
    // store data is null
    if (!createAccountData || !verifyEmailData) {
      toast.error("Something went wrong. Please try again.");
      setStepNo(1);
      return;
    }

    // Create account
    createAccountMutation({
      email: createAccountData.email,
      firstName: createAccountData.firstName,
      lastName: createAccountData.lastName,
      pwd: createAccountData.pwd,
      verificationCodeId: verifyEmailData.codeId,
      secretCode: formData.verificationCode,
      isSocialSignUp: false,
    });
  };

  // Return form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <fieldset
          disabled={isSubmitting || isCreationPending}
          className="w-full space-y-3.5"
        >
          {/* Verificaiton code */}
          <InputField {...verificationCodeProps} />

          {/* Submit button */}
          <SubmitButton
            className="!mt-5 w-full"
            primaryText="Verify code"
            isPending={isSubmitting || isCreationPending}
          />
        </fieldset>
      </form>
    </Form>
  );
};
