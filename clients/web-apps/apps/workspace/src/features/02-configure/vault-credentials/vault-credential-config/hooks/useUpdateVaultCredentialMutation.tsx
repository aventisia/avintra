import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { updateVaultCredential } from "../../apis/vault-credentials.apis";
import { type VaultCredentialDto } from "../../dtos/vault-credentials.dto";
import { useTableTab } from "../../hooks/useTableTab";
import { isOAuthCredentialType } from "../constants/vault-credential-oauth-types.constant";
import { useOAuthConnect } from "./useOAuthConnect";

export const useUpdateVaultCredentialMutation = () => {
  const { queryKey } = useTableTab();

  const queryClient = useQueryClient();

  const { openOAuthPopup, navigateOAuthPopup, pollOAuthStatus } = useOAuthConnect();
  const oauthPopupRef = useRef<Window | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const mutation = useMutation({
    mutationFn: updateVaultCredential,

    onError: (error) => {
      oauthPopupRef.current?.close();
      setHasFailed(true);
      setIsComplete(true);
      toast.error(error.toString());
    },
    onSuccess: async (httpResponse, payload) => {
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });

      const isOAuth = isOAuthCredentialType(payload?.type);

      const response = httpResponse as typeof httpResponse & {
        oauthConnectUrl?: string;
        OAuthConnectUrl?: string;
      };
      const responseData = response?.data as VaultCredentialDto & { OAuthConnectUrl?: string };
      const oauthUrl =
        responseData?.oauthConnectUrl ??
        responseData?.OAuthConnectUrl ??
        response?.oauthConnectUrl ??
        response?.OAuthConnectUrl;
      const vaultCredentialId = responseData?.id;
      if (isOAuth && oauthUrl && vaultCredentialId) {
        oauthPopupRef.current = navigateOAuthPopup(oauthPopupRef.current, oauthUrl);
        const connected = await pollOAuthStatus(vaultCredentialId, oauthPopupRef.current);
        if (connected) {
          toast.success("OAuth connection established", {
            className: "sonner-toaster-sm",
          });
        } else {
          toast.error(
            "OAuth connection was not completed. You can reconnect from the vault row actions.",
            {
              className: "sonner-toaster-sm",
            },
          );
        }
      } else if (isOAuth) {
        oauthPopupRef.current?.close();
        toast.error("OAuth connection URL was not returned by the server.", {
          className: "sonner-toaster-sm",
        });
      }

      setIsComplete(true);

      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
    },
  });

  const mutate = (payload: Parameters<typeof mutation.mutate>[0]) => {
    setIsComplete(false);
    setHasFailed(false);
    oauthPopupRef.current = isOAuthCredentialType(payload?.type) ? openOAuthPopup() : null;
    mutation.mutate(payload);
  };

  return { ...mutation, mutate, isComplete, hasFailed };
};
