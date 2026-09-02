import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { insertVault } from "../../apis/vaults-table-apis";
import { type VaultsTableDto } from "../../dtos/vaults-table-dto";
import { useTableTab } from "../../hooks/useTableTab";
import { useOAuthConnect } from "./useOAuthConnect";

export const useAddCredMutation = () => {
  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // // Get the query client for cache management
  const queryClient = useQueryClient();

  const { openOAuthPopup, navigateOAuthPopup, pollOAuthStatus } = useOAuthConnect();
  const oauthPopupRef = useRef<Window | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const mutation = useMutation({
    // API call to insert cred
    mutationFn: insertVault,

    // Show error toast if the mutation fails
    onError: (error) => {
      oauthPopupRef.current?.close();
      setIsComplete(true);
      toast.error(error.toString());
    },
    onSuccess: async (httpResponse) => {
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });

      // If the credential is OAuth-capable, navigate the already-open popup to
      // the connect URL and poll status until consent completes.
      const response = httpResponse as typeof httpResponse & {
        oauthConnectUrl?: string;
        OAuthConnectUrl?: string;
      };
      const responseData = response?.data as VaultsTableDto & { OAuthConnectUrl?: string };
      const oauthUrl =
        responseData?.oauthConnectUrl ??
        responseData?.OAuthConnectUrl ??
        response?.oauthConnectUrl ??
        response?.OAuthConnectUrl;
      const appSecretId = responseData?.id;
      if (oauthUrl && appSecretId) {
        oauthPopupRef.current = navigateOAuthPopup(oauthPopupRef.current, oauthUrl);
        const connected = await pollOAuthStatus(appSecretId, oauthPopupRef.current);
        if (connected) {
          toast.success("OAuth connection established", {
            className: "sonner-toaster-sm",
          });
        } else {
          toast.error("OAuth connection was not completed. You can reconnect from the vault row actions.", {
            className: "sonner-toaster-sm",
          });
        }
      } else if (responseData?.type === "M365") {
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

  // Trigger the mutation. The popup is opened synchronously here inside the
  // user gesture, then navigated to the OAuth connect URL in onSuccess once the
  // backend returns it. This avoids browser popup blockers.
  const mutate = (payload: Parameters<typeof mutation.mutate>[0]) => {
    setIsComplete(false);
    oauthPopupRef.current = openOAuthPopup();
    mutation.mutate(payload);
  };

  return { ...mutation, mutate, isComplete };
};
