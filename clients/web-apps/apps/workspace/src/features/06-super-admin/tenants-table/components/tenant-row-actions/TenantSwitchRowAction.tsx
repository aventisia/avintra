import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { ShieldHalfIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useAppLoaderStore } from "@/stores/app-loader-store";

import { switchTenant } from "../../apis/tenants-table-apis";

interface TenantSwitchRowActionProps {
  rowId: string;
}

export const TenantSwitchRowAction = ({ rowId }: TenantSwitchRowActionProps) => {
  const { showLoader } = useAppLoaderStore(
    useShallow((state) => ({ showLoader: state.showLoader })),
  );
  const { mutate } = useMutation({
    mutationFn: switchTenant,
    onSuccess: () => {
      localStorage.setItem("tenant_switch", "true");
      window.location.reload();
    },
  });

  return (
    <SimpleDDMenuItem
      content="Switch Tenant"
      Icon={ShieldHalfIcon}
      onClick={() => {
        mutate(rowId);
        showLoader("Switching tenant...");
      }}
    />
  );
};
