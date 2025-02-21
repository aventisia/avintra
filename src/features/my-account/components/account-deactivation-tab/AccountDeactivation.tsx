import { FormCheck } from "@/components/Form";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { useShallow } from "zustand/react/shallow";
import { VerificationCodeRequestTypesEnum } from "@/react-toolkit/enums/verification-code-request-types-enum";
import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
import { z } from "zod";
import { Form } from "@/react-toolkit/ui/form/Form";
import { useDefineDeactivationForm } from "../../hooks/useDefineDeactivationForm";
import { useCreateCodeMutationForDeactivation } from "../../hooks/useCreateCodeMutationForDeactivation";

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
  const { form, isSubmitting, deactivationStatusData, isLoading } =
    useDefineDeactivationForm();
  // Get mutation to create verification code
  const { createCodeMutation } = useCreateCodeMutationForDeactivation();

  // Define submit handler
  const onSubmit = () => {
    // Create verification code
    createCodeMutation({
      email: userSession!.email,
      requestType: VerificationCodeRequestTypesEnum.TwoFA,
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
        <div className="mb-6 flex items-center border-b border-dashed border-slate-300/70 pb-5 text-[0.94rem] font-medium">
          Account Deactivation
        </div>
        <div>
          {(deactivationStatusData?.deactivating && (
            <div className="leading-relaxed">
              You already initiated the deletion process. Your account will be
              deactivated on{" "}
              {deactivationStatusData?.timeRemains.toLocaleDateString()} ,cancel
              the deletion if needed.
            </div>
          )) || (
            <div className="leading-relaxed">
              When you initiate the account deletion process, you'll no longer
              have access to Front account services, and your personal data will
              be permanently removed. You have a 10-day window to cancel the{" "}
              deletion if needed.
            </div>
          )}
          <FormCheck className="mt-5">
            <FormCheck.Input
              id="confirm-delete-account"
              type="checkbox"
              name="confirmDelete"
              required
            />
            <FormCheck.Label htmlFor="checkbox-switch-1">
              {deactivationStatusData?.deactivating
                ? "Confirm that I want to stop deletion process of my account."
                : "Confirm that I want to delete my account."}
            </FormCheck.Label>
          </FormCheck>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-dashed border-slate-300/70 pt-5 md:flex-row md:justify-end">
          <SubmitButton
            isPending={isLoading || isSubmitting}
            variant="destructive"
            className="text-md"
          >
            Continue
          </SubmitButton>
        </div>
      </div>
    </Form>
  );
};
