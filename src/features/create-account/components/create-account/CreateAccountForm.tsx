import { VerificationCodeRequestTypesEnum } from "@/react-toolkit/enums/verification-code-request-types-enum";

import { SubmitButton } from "@aventisia/ui/buttons";
import { FloatingLabelInputField } from "@aventisia/ui/form";
import { CheckboxField } from "@aventisia/ui/form";
import { Form } from "@aventisia/ui/form";
import * as z from "zod";

import { createAccountZodSchema } from "../../constants/create-account-zod-schema";
import {
  confirmPwdProps,
  emailProps,
  firstNameProps,
  lastNameProps,
  pwdProps,
} from "../../constants/form-field-props";
import { useCreateCodeMutation } from "../../hooks/useCreateCodeMutation";
import { useDefineCreateAccountForm } from "../../hooks/useDefineCreateAccountForm";
import { TermsOfServiceLabel } from "./TermsOfServiceLabel";

/**
 * Component for the create account form.
 */
export const CreateAccountForm = () => {
  // Define form
  const {
    form,
    isSubmitting,
    setCreateAccountData,
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useDefineCreateAccountForm();

  // Get mutation to create verification code
  const { createCodeMutation, isCodePending } = useCreateCodeMutation();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof createAccountZodSchema>) => {
    // Stash the create account data
    setCreateAccountData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      pwd: formData.pwd,
    });

    // Create verification code
    createCodeMutation({
      email: formData.email,
      requestType: VerificationCodeRequestTypesEnum.VerifyEmailAddress,
    });

    // Reset the availability message
    setAvailabilityMessage(null);
  };

  // Return form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isCodePending}
    >
      <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
        {/* First Name */}
        <FloatingLabelInputField {...firstNameProps} />

        {/* Last Name */}
        <FloatingLabelInputField {...lastNameProps} />
      </div>

      {/* Email */}
      <FloatingLabelInputField
        {...emailProps}
        onChangeCapture={(e: { currentTarget: { value: string } }) =>
          handleInputChange(e.currentTarget.value)
        }
        nonErrorMessage={availabilityMessage}
      />

      <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
        {/* Password */}
        <FloatingLabelInputField {...pwdProps} />

        {/* Confirm Password */}
        <FloatingLabelInputField {...confirmPwdProps} />
      </div>

      {/* Terms and Conditions */}
      <CheckboxField name="termsAgreement" label={<TermsOfServiceLabel />} />

      {/* Submit form */}
      <SubmitButton
        className="!mt-5 h-11 w-full text-md"
        primaryText="Create"
        isPending={isSubmitting || isCodePending}
        disabled={!isAvailable || isCheckPending}
      />
    </Form>
  );
};
