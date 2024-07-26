import { InputField } from "@/react-toolkit/form/components/fields/InputField";
import { Form } from "@/react-toolkit/form/components/form/Form";
import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
import { toast } from "sonner";
import { z } from "zod";
import { verificationCodeProps } from "../../constants/form-field-props";
import { verifyCodeZodSchema } from "../../constants/verify-code-zod-schema";
import { useDefineVerifyCodeForm } from "../../hooks/useDefineVerifyCodeForm";
import { useVerifyCodeMutation } from "../../hooks/useVerifyCodeMutation";

export const VerifyCodeForm = () => {
  // Define form
  const { form, isSubmitting, verifyCodeData, setStepNo } =
    useDefineVerifyCodeForm();

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
