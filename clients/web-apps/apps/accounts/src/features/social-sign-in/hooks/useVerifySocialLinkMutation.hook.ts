import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useLoginStore } from "@/features/login/stores/login-store";

import { verifySocialLink } from "../apis/social-sign-in.apis";
import { useCompleteSocialSignIn } from "./useCompleteSocialSignIn.hook";

/** Confirms the code that links the provider account and continues the sign-in. */
const useVerifySocialLinkMutation = () => {
  const { socialLinkData } = useLoginStore(
    useShallow((state) => ({
      socialLinkData: state.socialLinkData,
    })),
  );

  const { completeSocialSignIn } = useCompleteSocialSignIn();

  const { mutate: verifySocialLinkMutation, isPending: isVerifyPending } = useMutation({
    mutationFn: verifySocialLink,
    onSuccess: ({ data }) => {
      completeSocialSignIn(data);
    },
    onError: (error) => {
      toast.error(String(error));
    },
  });

  return { socialLinkData, verifySocialLinkMutation, isVerifyPending };
};

export { useVerifySocialLinkMutation };
