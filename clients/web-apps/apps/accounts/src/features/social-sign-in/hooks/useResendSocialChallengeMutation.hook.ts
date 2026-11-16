import { VerificationCodeRequestTypesEnum } from "@avplatform/ui/enums";
import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { SOCIAL_SIGN_IN_STATUS } from "@/constants/variables";
import { useLoginStore } from "@/features/login/stores/login-store";

import { resendSocialChallenge } from "../apis/social-sign-in.apis";

/** Sends a fresh two-step or account-link code for the outstanding social attempt. */
const useResendSocialChallengeMutation = () => {
  const {
    socialChallenge,
    socialLinkData,
    setTwoFACodeData,
    setSocialChallenge,
    setSocialLinkData,
  } = useLoginStore(
    useShallow((state) => ({
      socialChallenge: state.socialChallenge,
      socialLinkData: state.socialLinkData,
      setTwoFACodeData: state.setTwoFACodeData,
      setSocialChallenge: state.setSocialChallenge,
      setSocialLinkData: state.setSocialLinkData,
    })),
  );

  const { mutate: resendSocialChallengeMutation, isPending: isResendPending } = useMutation({
    mutationFn: resendSocialChallenge,
    onSuccess: ({ data }) => {
      if (!data?.verificationCodeId) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      if (data.status === SOCIAL_SIGN_IN_STATUS.LinkCodeRequired) {
        setSocialLinkData({
          codeId: data.verificationCodeId,
          email: data.email ?? "",
          provider: data.provider ?? "",
        });
      } else {
        setTwoFACodeData({
          email: data.email ?? "",
          requestType: VerificationCodeRequestTypesEnum.TwoFA,
          codeId: data.verificationCodeId,
        });
        setSocialChallenge(
          socialChallenge ? { ...socialChallenge, codeId: data.verificationCodeId } : null,
        );
      }

      toast.success("A new code has been sent to your email.");
    },
    onError: (error) => {
      toast.error(String(error));
    },
  });

  const resendSocialChallengeHandler = () => {
    const challenge = socialLinkData ?? socialChallenge;

    if (!challenge) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    resendSocialChallengeMutation({
      verificationCodeId: challenge.codeId,
      email: challenge.email,
      provider: challenge.provider,
    });
  };

  return { resendSocialChallengeHandler, isResendPending };
};

export { useResendSocialChallengeMutation };
