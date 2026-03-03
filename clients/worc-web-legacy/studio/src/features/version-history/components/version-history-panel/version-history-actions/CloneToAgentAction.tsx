import { CopyPlus } from "lucide-react";
import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useFetchVersionHistoryDetail } from "@/features/version-history/hooks/useFetchVersionHistoryDetail";
import { useCloneToAgentMutation } from "@/features/version-history/hooks/useCloneToAgentMutation";
import { useAppLoaderStore } from "@/stores/app-loader-store";
import { useShallow } from "zustand/react/shallow";

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
