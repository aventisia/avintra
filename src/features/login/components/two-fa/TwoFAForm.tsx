import {
  verificationCodeProps,
  useDefineTwoFAForm,
  useCheck2FACodeMutation,
  twoFAZodSchema,
} from "@/features/login";
import * as z from "zod";
import { SubmitButton } from "@/react-toolkit/components/ui";
import { Form, InputField } from "@/react-toolkit/components/form";
import { toast } from "sonner";

export const TwoFAForm = () => {
  // Define form
  const { form, isSubmitting, twoFACodeData, resetLoginProcess } =
    useDefineTwoFAForm();

  // Get mutation
  const { check2FACodeMutation, isCheckPending } = useCheck2FACodeMutation();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof twoFAZodSchema>) => {
    // Store data is null
    if (!twoFACodeData) {
      toast.error("Something went wrong. Please try again.");
      resetLoginProcess();
      return;
    }

    // Try to authenticate user
    check2FACodeMutation({
      email: twoFACodeData.email,
      requestType: twoFACodeData.requestType,
      verificationCodeId: twoFACodeData.codeId,
      secretCode: formData.verificationCode,
    });
  };

  // Return form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <fieldset
          disabled={isSubmitting || isCheckPending}
          className="w-full space-y-3.5"
        >
          {/* Verificaiton code */}
          <InputField {...verificationCodeProps} />

          {/* Submit button */}
          <SubmitButton
            className="!mt-5 w-full"
            primaryText="Verify code"
            isPending={isSubmitting || isCheckPending}
          />
        </fieldset>
      </form>
    </Form>
  );
};
