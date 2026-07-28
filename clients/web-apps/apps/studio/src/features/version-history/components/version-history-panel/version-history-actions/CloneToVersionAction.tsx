import { Copy } from "lucide-react";
import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useFetchVersionHistoryDetail } from "@/features/version-history/hooks/useFetchVersionHistoryDetail";
import { useCloneToVersionMutation } from "@/features/version-history/hooks/useCloneToVersionMutation";
import { useAppLoaderStore } from "@/stores/app-loader-store";
import { useShallow } from "zustand/react/shallow";

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
      Icon={Copy}
      size="sm"
      content="Clone to new version"
      onClick={handleClone}
    />
  );
}
