import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { toast } from "@avplatform/ui/sonner";
import { PlugIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

import { createOAuthConnectLink } from "../../apis/vault-credentials.apis";
import { useTableTab } from "../../hooks/useTableTab";
import { useOAuthConnect } from "../../vault-credential-config/hooks/useOAuthConnect";

interface VaultCredentialRowReconnectActionProps {
  rowId: string;
}

export const VaultCredentialRowReconnectAction: React.FC<
  VaultCredentialRowReconnectActionProps
> = ({ rowId }) => {
  const { queryKey } = useTableTab();
  const queryClient = useQueryClient();
  const { openOAuthPopup, navigateOAuthPopup, pollOAuthStatus } = useOAuthConnect();

  const { mutate, isPending } = useMutation({
    mutationFn: createOAuthConnectLink,
    onSuccess: async (httpResponse) => {
      const connectUrl = httpResponse?.data?.connectUrl;
      if (!connectUrl) {
        toast.error("OAuth connect URL was not returned by the server.", {
          className: "sonner-toaster-sm",
        });
        return;
      }

      const popup = navigateOAuthPopup(openOAuthPopup(), connectUrl);
      const connected = await pollOAuthStatus(rowId, popup);

      if (connected) {
        toast.success("OAuth connection established", {
          className: "sonner-toaster-sm",
        });
      } else {
        toast.error("OAuth connection was not completed.", {
          className: "sonner-toaster-sm",
        });
      }

      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(error.toString(), {
        className: "sonner-toaster-sm",
      });
    },
  });

  return (
    <SimpleDDMenuItem
      size="md"
      content="Reconnect"
      Icon={PlugIcon}
      disabled={isPending}
      onClick={() => mutate(rowId)}
    />
  );
};
