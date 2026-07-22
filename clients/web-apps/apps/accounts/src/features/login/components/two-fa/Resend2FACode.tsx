import { ContentFooter } from "@/components/ui/ContentFooter";
import { ResendCodeButton } from "@/components/ui/ResendCodeButton";

import { useAuthenticateUserMutation } from "../../hooks/useAuthenticateUserMutation";

export const Resend2FACode = () => {
  // Get mutation
  const { resend2FACodeHandler, isAuthPending } = useAuthenticateUserMutation();

  return (
    <ContentFooter className="text-md !mb-3 flex-col gap-4 mlg:!mb-0 mlg:flex-row mlg:gap-1">
      Did not receive the code?
      <ResendCodeButton
        isPending={isAuthPending}
        disabled={isAuthPending}
        resendCodeFn={resend2FACodeHandler}
      />
    </ContentFooter>
  );
};
