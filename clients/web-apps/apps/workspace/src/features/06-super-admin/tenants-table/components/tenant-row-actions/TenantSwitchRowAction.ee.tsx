import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ShieldCheckeredIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useAppLoaderStore } from "@/stores/app-loader-store";

import { switchTenant } from "../../apis/tenants-table-apis.ee";

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
      content="Switch tenant"
      Icon={ShieldCheckeredIcon}
      onClick={() => {
        mutate(rowId);
        showLoader("Switching tenant...");
      }}
    />
  );
};
