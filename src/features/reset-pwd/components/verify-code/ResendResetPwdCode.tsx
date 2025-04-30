import { ContentFooter } from "@/components/ui/ContentFooter";
import { ResendCodeButton } from "@/components/ui/ResendCodeButton";

import { useResendCodeMutation } from "../../hooks/useResendCodeMutation";

export const ResendResetPwdCode = () => {
  // Get mutation to resend verification code
  const { resendCodeHandler, isResendCodePending } = useResendCodeMutation();

  return (
    <ContentFooter className="text-md !mb-3 flex-col gap-4 mlg:!mb-0 mlg:flex-row mlg:gap-1">
      Did not receive the code?
      <ResendCodeButton
        isPending={isResendCodePending}
        disabled={isResendCodePending}
        resendCodeFn={resendCodeHandler}
      />
    </ContentFooter>
  );
};
