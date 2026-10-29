import { Button, ResendCodeButton, SubmitButton } from "@avplatform/ui/buttons";
import Lucide from "@avplatform/ui/components/Lucide";
import { Form, InputOtpField } from "@avplatform/ui/form";
import { toast } from "@avplatform/ui/sonner";
import type { z } from "zod";

import { verificationCodeProps } from "../../constants/constants";
import { verifyEmailZodSchema } from "../../constants/verify-email-zod-schema";
import { useDefineVerifyEmailForm } from "../../hooks/useDefineVerifyEmailForm";
import { useProfileEmailMutation } from "../../hooks/useProfileEmailMutation";
import { useResendCodeMutationForEmailUpdate } from "../../hooks/useResendCodeMutationForEmailUpdate";
import { InputDivElement } from "../InputDivElement";

export const VerifyEmail = () => {
  // Define form
  const { form, isSubmitting, updateProfileEmailData, verifyEmailData, setStepNo } =
    useDefineVerifyEmailForm();

  // Get mutation to update email
  const { updateProfileEmailMutation, isUpdatePending } = useProfileEmailMutation();

  const { resendCodeHandler, isResendCodePending } = useResendCodeMutationForEmailUpdate();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof verifyEmailZodSchema>) => {
    // store data is null
    if (!updateProfileEmailData || !verifyEmailData) {
      toast.error("Something went wrong. Please try again.");
      setStepNo(1);
      return;
    }

    // update email
    updateProfileEmailMutation({
      email: updateProfileEmailData.email,
      verificationCodeId: verifyEmailData.codeId,
      secretCode: formData.verificationCode,
    });
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isUpdatePending}
      checkDirtyForm={false}
    >
      <div className="box flex flex-col p-5">
        {/* <div className="mb-6 border-b border-dashed border-line pb-5 text-sm font-medium">
          Email settings
        </div> */}
        <div>
          <InputDivElement
            headingForInput="Verify Your Email"
            isRequired={true}
            messageForInput={`Please enter the verification code sent to your new email ${updateProfileEmailData?.email}.`}
          >
            <InputOtpField containerClassName="!justify-center" {...verificationCodeProps} />
          </InputDivElement>
        </div>
        <div className="flex flex-wrap pt-5 md:justify-end">
          <Button
            className="me-auto text-sm font-normal"
            variant={"link"}
            type="button"
            onClick={() => setStepNo(1)}
          >
            <Lucide icon="ArrowLeft" className="h-6 w-6" />
            <span className="ml-1">Incorrect email</span>
          </Button>
          <div className="me-2 flex flex-row flex-wrap items-center gap-2 text-sm">
            <p>Did not receive the code?</p>
            <ResendCodeButton
              isPending={isResendCodePending}
              disabled={isResendCodePending}
              resendCodeFn={resendCodeHandler}
            />
          </div>
          <SubmitButton
            primaryText="Submit"
            className="text-sm"
            isPending={isSubmitting || isUpdatePending}
          />
        </div>
      </div>
    </Form>
  );
};
