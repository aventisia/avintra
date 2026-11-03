import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { CopyIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { useCloneToVersionMutation } from "@/features/version-history/hooks/useCloneToVersionMutation";
import { useFetchVersionHistoryDetail } from "@/features/version-history/hooks/useFetchVersionHistoryDetail";
import { useAppLoaderStore } from "@/stores/app-loader-store";

export default function CloneToVersionAction({ id }: { id: string }) {
  const detailQuery = useFetchVersionHistoryDetail(id);
  const cloneToNewVersionMutation = useCloneToVersionMutation();

  const { showLoader } = useAppLoaderStore(
    useShallow((state) => ({ showLoader: state.showLoader })),
  );

  const handleClone = async () => {
    showLoader("Cloning in process...");

    const { data } = await detailQuery.refetch();
    if (!data) return;

    cloneToNewVersionMutation.mutate(data);
  };

  return (
    <SimpleDDMenuItem
      Icon={CopyIcon}
      size="sm"
      content="Clone to new version"
      onClick={handleClone}
    />
  );
}
