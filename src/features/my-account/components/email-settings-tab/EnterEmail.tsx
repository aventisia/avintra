import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { InputDivElement } from "../InputDivElement";
import type { z } from "zod";
import { DefaultTenantsEnum } from "@/react-toolkit/enums/default-tenants-enum";
import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { useShallow } from "zustand/react/shallow";
import type { updateEmailZodSchema } from "../../types/create-account-zod-schema";
import { VerificationCodeRequestTypesEnum } from "@/react-toolkit/enums/verification-code-request-types-enum";
import { useDefineEmailUpdateForm } from "../../hooks/useDefineEmailUpdateForm";
import { useCreateCodeMutationForEmailUpdate } from "../../hooks/useCreateCodeMutationForEmailUpdate";

export const EnterEmail = () => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  // Define form
  const {
    form,
    isSubmitting,
    setUpdateProfileEmailData,
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useDefineEmailUpdateForm();

  // Get mutation to create verification code
  const { createCodeMutation, isCodePending } =
    useCreateCodeMutationForEmailUpdate();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof updateEmailZodSchema>) => {
    // Stash the update email data
    setUpdateProfileEmailData({
      email: formData.email,
    });

    // Create verification code
    createCodeMutation({
      email: formData.email,
      requestType: VerificationCodeRequestTypesEnum.SendOtpToEmail,
    });

    // Reset the availability message
    setAvailabilityMessage(null);
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={
        userSession?.tenantName != DefaultTenantsEnum.IndividualUsers &&
        (isSubmitting || isCodePending)
      }
      className="px-2.5 pb-5"
    >
      <div className="box flex flex-col p-5">
        <div className="mb-6 border-b border-dashed border-slate-300/70 pb-5 text-[0.94rem] font-medium">
          Email Settings
        </div>
        <div>
          <div className="inline-flex gap-1 text-slate-500">
            Your current email address is
            <p className="font-medium">{userSession?.email}</p>
          </div>
          <InputDivElement
            headingForInput={"Email"}
            isRequired={
              userSession?.tenantName == DefaultTenantsEnum.IndividualUsers
            }
            messageForInput={
              userSession?.tenantName == DefaultTenantsEnum.IndividualUsers
                ? "Please provide a valid email where we can reach you if needed."
                : "Your current tenant email address."
            }
          >
            <InputField
              name="email"
              type="email"
              className="text-md border-slate-300/60 shadow-sm"
              {...(userSession?.tenantName == DefaultTenantsEnum.IndividualUsers
                ? {
                    onChangeCapture: (e) =>
                      handleInputChange(e.currentTarget.value),
                    nonErrorMessage: availabilityMessage,
                    isRequired: true,
                    disabled: false,
                    placeholder: "new@emai.com",
                  }
                : {
                    disabled: true,
                    placeholder: userSession?.email,
                  })}
            />
          </InputDivElement>
        </div>
        <div className="mt-6 flex border-t border-dashed border-slate-300/70 pt-5 md:justify-end">
          {userSession?.tenantName == DefaultTenantsEnum.IndividualUsers && (
            <SubmitButton
              className="text-md"
              primaryText="Verify"
              isPending={isSubmitting || isCodePending}
              disabled={!isAvailable || isCheckPending}
            />
          )}
        </div>
      </div>
    </Form>
  );
};
