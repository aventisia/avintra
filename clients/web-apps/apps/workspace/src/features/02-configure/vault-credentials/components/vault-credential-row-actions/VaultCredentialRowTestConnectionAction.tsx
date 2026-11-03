import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { toast } from "@avplatform/ui/sonner";
import { PulseIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

import { testCorsairCredential } from "../../apis/vault-credentials.apis";
import { useTableTab } from "../../hooks/useTableTab";

interface VaultCredentialRowTestConnectionActionProps {
  rowId: string;
}

export const VaultCredentialRowTestConnectionAction: React.FC<
  VaultCredentialRowTestConnectionActionProps
> = ({ rowId }) => {
  const { queryKey } = useTableTab();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: testCorsairCredential,
    onSuccess: async (response) => {
      const result = response.data;
      if (result?.status === "Failed" || result?.status === "Expired") {
        toast.error(result.reason ?? "Connection test failed.");
      } else if (result?.status === "Connected") {
        toast.success("Connection is available.");
      } else {
        toast.info(result?.reason ?? "This credential cannot be tested automatically.");
      }
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error.toString()),
  });

  return (
    <SimpleDDMenuItem
      size="md"
      content="Test connection"
      Icon={PulseIcon}
      disabled={isPending}
      onClick={() => mutate(rowId)}
    />
  );
};
