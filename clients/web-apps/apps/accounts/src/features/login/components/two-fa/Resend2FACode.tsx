import { useShallow } from "zustand/react/shallow";

import { ContentFooter } from "@/components/ui/ContentFooter";
import { ResendCodeButton } from "@/components/ui/ResendCodeButton";
import { useResendSocialChallengeMutation } from "@/features/social-sign-in";

import { useAuthenticateUserMutation } from "../../hooks/useAuthenticateUserMutation";
import { useLoginStore } from "../../stores/login-store";

export const Resend2FACode = () => {
  // Get mutation used by the password flow
  const { resend2FACodeHandler, isAuthPending } = useAuthenticateUserMutation();

  // A social attempt has no password to re-send through, so it asks for a fresh code instead
  const { socialChallenge } = useLoginStore(
    useShallow((state) => ({
      socialChallenge: state.socialChallenge,
    })),
  );
  const { resendSocialChallengeHandler, isResendPending } = useResendSocialChallengeMutation();

  const isPending = socialChallenge ? isResendPending : isAuthPending;

  return (
    <ContentFooter className="text-md !mb-3 flex-col gap-4 mlg:!mb-0 mlg:flex-row mlg:gap-1">
      Did not receive the code?
      <ResendCodeButton
        isPending={isPending}
        disabled={isPending}
        resendCodeFn={socialChallenge ? resendSocialChallengeHandler : resend2FACodeHandler}
      />
    </ContentFooter>
  );
};
