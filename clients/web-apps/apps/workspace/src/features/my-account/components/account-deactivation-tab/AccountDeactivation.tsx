import { SubmitButton } from "@avplatform/ui/buttons";
import { VerificationCodeRequestTypesEnum } from "@avplatform/ui/enums";
import { CheckboxField, Form } from "@avplatform/ui/form";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useCreateCodeMutationForDeactivation } from "../../hooks/useCreateCodeMutationForDeactivation";
import { useDefineDeactivationForm } from "../../hooks/useDefineDeactivationForm";

export const AccountDeactivationZodSchema = z.object({
  confirmDelete: z.boolean({
    message: "Please confirm by checking the checkbox",
  }),
});

export const AccountDeactivation = () => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  const { form, isSubmitting, deactivationStatusData, isLoading } = useDefineDeactivationForm();
  // Get mutation to create verification code
  const { createCodeMutation } = useCreateCodeMutationForDeactivation();

  // Define submit handler
  const onSubmit = () => {
    // Create verification code
    createCodeMutation({
      email: userSession!.email,
      requestType: VerificationCodeRequestTypesEnum.AccountDeactivation,
    });
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isLoading}
      checkDirtyForm={false}
    >
      <div className="box box--stacked flex flex-col p-5">
        {/* <div className="mb-6 flex items-center border-b border-dashed border-line pb-5 text-sm font-medium">
          Account deactivation
        </div> */}
        <div>
          {(deactivationStatusData?.deactivating && (
            <div className="mb-4 leading-relaxed">
              You already initiated the deletion process. Your account will be deactivated on{" "}
              {deactivationStatusData?.timeRemains.toLocaleDateString()} ,cancel the deletion if
              needed.
            </div>
          )) || (
            <div className="mb-4 text-sm leading-relaxed">
              When you initiate the account deletion process, you'll no longer have access to Front
              account services, and your personal data will be permanently removed. You have a
              10-day window to cancel the deletion if needed.
            </div>
          )}
          <CheckboxField
            name="confirmDelete"
            label={
              deactivationStatusData?.deactivating ? (
                <span className="text-sm">
                  Confirm that I want to stop deletion process of my account.
                </span>
              ) : (
                <span className="text-sm">Confirm that I want to delete my account.</span>
              )
            }
            required={true}
          />
        </div>
        <div className="flex flex-col-reverse gap-3 pt-5 md:flex-row md:justify-end">
          <SubmitButton
            isPending={isLoading || isSubmitting}
            variant="destructive"
            primaryText="Continue"
          />
        </div>
      </div>
    </Form>
  );
};
