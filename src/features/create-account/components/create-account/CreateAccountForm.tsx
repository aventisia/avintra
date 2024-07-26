import { VerificationCodeRequestTypesEnum } from "@/react-toolkit/enums/verification-code-request-types-enum";
import { CheckboxField } from "@/react-toolkit/form/components/fields/CheckboxField";
import { InputField } from "@/react-toolkit/form/components/fields/InputField";
import { Form } from "@/react-toolkit/form/components/form/Form";
import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
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
import { useIsEmailAvailable } from "../../hooks/useIsEmailAvailable";
import { TermsAndConditionsLabel } from "./TermsAndConditionsLabel";

/**
 * Component for the create account form.
 */
export const CreateAccountForm = () => {
  // Define form
  const { form, isSubmitting, setCreateAccountData } =
    useDefineCreateAccountForm();

  // Get state and methods for availability check
  const {
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  } = useIsEmailAvailable(form);

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <fieldset
          disabled={isSubmitting || isCodePending}
          className="w-full space-y-3.5"
        >
          <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
            {/* First Name */}
            <InputField {...firstNameProps} />

            {/* Last Name */}
            <InputField {...lastNameProps} />
          </div>

          {/* Email */}
          <InputField
            {...emailProps}
            onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
            nonErrorMessage={availabilityMessage}
          />

          <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
            {/* Password */}
            <InputField {...pwdProps} />

            {/* Confirm Password */}
            <InputField {...confirmPwdProps} />
          </div>

          {/* Terms and Conditions */}
          <CheckboxField
            name="termsAgreement"
            label={<TermsAndConditionsLabel />}
          />

          {/* Submit form */}
          <SubmitButton
            className="!mt-5 w-full"
            primaryText="Create"
            isPending={isSubmitting || isCodePending}
            disabled={!isAvailable || isCheckPending}
          />
        </fieldset>
      </form>
    </Form>
  );
};
