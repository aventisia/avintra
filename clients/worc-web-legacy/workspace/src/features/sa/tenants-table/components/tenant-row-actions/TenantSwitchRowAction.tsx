import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { setUserSessionLocally } from "@/react-toolkit/utils/user-session-utils";

import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { ShieldHalfIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { switchTenant } from "../../apis/tenants-table-apis";

interface TenantSwitchRowActionProps {
  rowId: string;
}

export const TenantSwitchRowAction = ({
  rowId,
}: TenantSwitchRowActionProps) => {
  const { setUserSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
      setUserSession: state.setUserSession,
    })),
  );

  const { mutate } = useMutation({
    mutationFn: switchTenant,
    onSuccess: (httpResponse) => {
      toast.success(httpResponse.message);
      // Set authenticated user locally and session obj in store
      setUserSession(setUserSessionLocally(httpResponse.data));
    },
  });

  return (
    <SimpleDDMenuItem
      content="Switch Tenant"
      Icon={ShieldHalfIcon}
      onClick={() => mutate(rowId)}
    />
  );
};
