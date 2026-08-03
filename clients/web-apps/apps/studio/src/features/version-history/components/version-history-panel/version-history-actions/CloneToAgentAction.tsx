import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { CopyPlus } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useCloneToAgentMutation } from "@/features/version-history/hooks/useCloneToAgentMutation";
import { useFetchVersionHistoryDetail } from "@/features/version-history/hooks/useFetchVersionHistoryDetail";
import { useAppLoaderStore } from "@/stores/app-loader-store";

export default function CloneToAgentAction({ id }: { id: string }) {
  const detailQuery = useFetchVersionHistoryDetail(id);
  const cloneToNewAgentMutation = useCloneToAgentMutation();

  const { showLoader } = useAppLoaderStore(
    useShallow((state) => ({ showLoader: state.showLoader })),
  );

  const handleClone = async () => {
    showLoader("Cloning in process...");
    const { data } = await detailQuery.refetch();
    if (!data) return;

    cloneToNewAgentMutation.mutate(data);
  };

  return (
    <SimpleDDMenuItem
      Icon={CopyPlus}
      size="sm"
      content="Clone to new agent"
      onClick={handleClone}
    />
  );
}
