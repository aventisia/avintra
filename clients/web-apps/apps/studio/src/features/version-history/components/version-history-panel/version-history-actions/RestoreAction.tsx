import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { RotateCcw } from "lucide-react";

import { useFetchVersionHistoryDetail } from "@/features/version-history/hooks/useFetchVersionHistoryDetail";
import { useRestoreAgentVersion } from "@/features/version-history/hooks/useRestoreAgentVersion";

export default function RestoreAction({ id }: { id: string }) {
  const detailQuery = useFetchVersionHistoryDetail(id);
  const restoreMutation = useRestoreAgentVersion();

  const handleRestore = async () => {
    const { data } = await detailQuery.refetch();
    if (!data?.reactFlowObject) return;

    restoreMutation.mutate(data);
  };

  return (
    <SimpleDDMenuItem
      Icon={RotateCcw}
      size="sm"
      content={"Restore"}
      disabled={restoreMutation.isPending}
      onClick={handleRestore}
    />
  );
}
