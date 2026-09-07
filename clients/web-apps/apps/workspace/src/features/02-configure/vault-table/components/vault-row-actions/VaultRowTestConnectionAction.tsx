import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActivityIcon } from "lucide-react";
import React from "react";

import { testCorsairCredential } from "../../apis/vaults-table-apis";
import { useTableTab } from "../../hooks/useTableTab";

interface VaultRowTestConnectionActionProps {
  rowId: string;
}

export const VaultRowTestConnectionAction: React.FC<VaultRowTestConnectionActionProps> = ({ rowId }) => {
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
      Icon={ActivityIcon}
      disabled={isPending}
      onClick={() => mutate(rowId)}
    />
  );
};