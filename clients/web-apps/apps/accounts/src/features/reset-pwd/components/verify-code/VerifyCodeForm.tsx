import { SubmitButton } from "@avplatform/ui/buttons";
import { InputOtpField } from "@avplatform/ui/form";
import { Form } from "@avplatform/ui/form";
import { toast } from "@avplatform/ui/sonner";
import { z } from "zod";

import { verificationCodeProps } from "../../constants/form-field-props";
import { verifyCodeZodSchema } from "../../constants/verify-code-zod-schema";
import { useDefineVerifyCodeForm } from "../../hooks/useDefineVerifyCodeForm";
import { useVerifyCodeMutation } from "../../hooks/useVerifyCodeMutation";

export const VerifyCodeForm = () => {
  // Define form
  const { form, isSubmitting, verifyCodeData, setStepNo } = useDefineVerifyCodeForm();

  // Get mutation
  const { checkCodeMutation, isCheckPending } = useVerifyCodeMutation();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof verifyCodeZodSchema>) => {
    // store data is null
    if (!verifyCodeData) {
      toast.error("Something went wrong. Please try again.");
      setStepNo(1);
      return;
    }

    // Verify code
    checkCodeMutation({
      email: verifyCodeData.email,
      requestType: verifyCodeData.requestType,
      verificationCodeId: verifyCodeData.codeId,
      secretCode: formData.verificationCode,
    });
  };

  // Return form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isCheckPending}
      checkDirtyForm={false}
    >
      {/* Verificaiton code */}
      <div className="px-2">
        <InputOtpField {...verificationCodeProps} />
      </div>

      {/* Submit button */}
      <SubmitButton
        className="!mt-5 h-control-lg w-full"
        primaryText="Verify code"
        isPending={isSubmitting || isCheckPending}
      />
    </Form>
  );
};
