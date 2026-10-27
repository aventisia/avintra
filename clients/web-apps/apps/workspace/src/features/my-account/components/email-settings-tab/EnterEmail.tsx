import { SubmitButton } from "@avplatform/ui/buttons";
// import { DefaultTenantsEnum } from "@avplatform/ui/enums/default-tenants-enum";
import { VerificationCodeRequestTypesEnum } from "@avplatform/ui/enums";
import { Form, InputField } from "@avplatform/ui/form";
import { useUserSessionStore } from "@avplatform/ui/stores";
import type { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useCreateCodeMutationForEmailUpdate } from "../../hooks/useCreateCodeMutationForEmailUpdate";
import { useDefineEmailUpdateForm } from "../../hooks/useDefineEmailUpdateForm";
import type { updateEmailZodSchema } from "../../types/create-account-zod-schema";
import { InputDivElement } from "../InputDivElement";

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
  const { createCodeMutation, isCodePending } = useCreateCodeMutationForEmailUpdate();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof updateEmailZodSchema>) => {
    // Stash the update email data
    setUpdateProfileEmailData({
      email: formData.email,
    });

    // Create verification code
    createCodeMutation({
      email: formData.email,
      requestType: VerificationCodeRequestTypesEnum.UpdateEmail,
    });

    // Reset the availability message
    setAvailabilityMessage(null);
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isCodePending}
    >
      <div className="box flex flex-col p-5">
        {/* <div className="mb-6 border-b border-dashed border-line pb-5 text-sm font-medium">
          Email Settings
        </div> */}
        <div>
          <div className="inline-flex gap-1 text-body text-muted-foreground">
            Your current email address is
            <p className="font-medium text-ink">{userSession?.email}</p>
          </div>
          <InputDivElement
            headingForInput={"Email"}
            // isRequired={
            //   userSession?.tenantName == DefaultTenantsEnum.IndividualUsers
            // }
            messageForInput={"New Email"}
          >
            <InputField
              name="email"
              type="email"
              className="border-input text-sm"
              {...{
                onChangeCapture: (e) => handleInputChange(e.currentTarget.value),
                nonErrorMessage: availabilityMessage,
                isRequired: false,
                disabled: false,
                placeholder: "Email",
              }}
            />
          </InputDivElement>
        </div>
        <div className="flex pt-5 md:justify-end">
          {
            <SubmitButton
              className="text-sm"
              primaryText="Verify"
              isPending={isSubmitting || isCodePending}
              disabled={!isAvailable || isCheckPending}
            />
          }
        </div>
      </div>
    </Form>
  );
};
