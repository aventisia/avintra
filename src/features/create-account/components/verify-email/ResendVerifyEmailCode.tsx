import { useResendCodeMutation } from "@/features/create-account";
import { ContentFooter, ResendCodeButton } from "@/components/ui";

export const ResendVerifyEmailCode = () => {
  // Get mutation to resend verification code
  const { resendCodeHandler, isResendCodePending } = useResendCodeMutation();

  return (
    <ContentFooter className="!mb-3 flex-col gap-4 mlg:!mb-0 mlg:flex-row mlg:gap-1">
      Did not receive the code?
      <ResendCodeButton
        isPending={isResendCodePending}
        disabled={isResendCodePending}
        resendCodeFn={resendCodeHandler}
      />
    </ContentFooter>
  );
};
