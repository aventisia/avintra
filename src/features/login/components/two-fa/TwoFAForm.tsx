import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { toast } from "sonner";
import * as z from "zod";
import { verificationCodeProps } from "../../constants/form-field-props";
import { twoFAZodSchema } from "../../constants/two-fa-zod-schema";
import { useCheck2FACodeMutation } from "../../hooks/useCheck2FACodeMutation";
import { useDefineTwoFAForm } from "../../hooks/useDefineTwoFAForm";

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
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isCheckPending}
    >
      {/* Verificaiton code */}
      <InputField {...verificationCodeProps} />

      {/* Submit button */}
      <SubmitButton
        className="!mt-5 w-full"
        primaryText="Verify code"
        isPending={isSubmitting || isCheckPending}
      />
    </Form>
  );
};
