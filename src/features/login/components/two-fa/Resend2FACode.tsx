import {
  useAuthenticateUserMutation,
} from "@/features/login";
import { ContentFooter, ResendCodeButton } from "@/components/ui";

export const Resend2FACode = () => {
  // Get mutation
  const { resend2FACodeHandler, isAuthPending } =
    useAuthenticateUserMutation();

  return (
    <ContentFooter className="!mb-3 flex-col gap-4 mlg:!mb-0 mlg:flex-row mlg:gap-1">
      Did not receive the code?
      <ResendCodeButton
        isPending={isAuthPending}
        disabled={isAuthPending}
        resendCodeFn={resend2FACodeHandler}
      />
    </ContentFooter>
  );
};
