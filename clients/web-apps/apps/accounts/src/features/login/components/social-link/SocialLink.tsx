import { useDocumentTitle } from "@avplatform/ui/hooks";
import { useShallow } from "zustand/react/shallow";

import { ContentContainer } from "@/components/ui/ContentContainer";
import { ContentFooter } from "@/components/ui/ContentFooter";
import { ContentHeader } from "@/components/ui/ContentHeader";
import { ResendCodeButton } from "@/components/ui/ResendCodeButton";
import { useResendSocialChallengeMutation } from "@/features/social-sign-in";

import { useLoginStore } from "../../stores/login-store";
import { BackToLogin } from "../two-fa/BackToLogin";
import { SocialLinkForm } from "./SocialLinkForm";

/** Asks for the one-time code that connects a provider account to an existing account. */
export const SocialLink = () => {
  useDocumentTitle("Confirm sign-in");

  const { socialLinkData } = useLoginStore(
    useShallow((state) => ({
      socialLinkData: state.socialLinkData,
    })),
  );

  const { resendSocialChallengeHandler, isResendPending } = useResendSocialChallengeMutation();

  return (
    <ContentContainer className="fadeInRTL">
      <ContentHeader
        biggerHeading={`This account uses ${socialLinkData?.provider ?? "a provider"}`}
        smallerHeading={`Enter the code sent to ${socialLinkData?.email ?? "your email"} to connect ${socialLinkData?.provider ?? "the provider"} to your account`}
      />

      <SocialLinkForm />

      <ContentFooter className="text-md !mb-3 flex-col gap-4 mlg:!mb-0 mlg:flex-row mlg:gap-1">
        Did not receive the code?
        <ResendCodeButton
          isPending={isResendPending}
          disabled={isResendPending}
          resendCodeFn={resendSocialChallengeHandler}
        />
      </ContentFooter>

      <BackToLogin />
    </ContentContainer>
  );
};
