import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { toast } from "@avplatform/ui/sonner";
import { CopySimpleIcon } from "@phosphor-icons/react";

import { useCloneToAgentMutation } from "@/features/version-history/hooks/useCloneToAgentMutation";
import { useFetchVersionHistoryDetail } from "@/features/version-history/hooks/useFetchVersionHistoryDetail";

export default function CloneToAgentAction({ id }: { id: string }) {
  const detailQuery = useFetchVersionHistoryDetail(id);
  const cloneToNewAgentMutation = useCloneToAgentMutation();

  const handleClone = async () => {
    try {
      const { data } = await detailQuery.refetch();
      if (!data) {
        toast.error("Unable to load version details. Please try again.");
        return;
      }

      cloneToNewAgentMutation.mutate(data);
    } catch {
      toast.error("Clone failed. Please try again.");
    }
  };

  return (
    <SimpleDDMenuItem
      Icon={CopySimpleIcon}
      size="sm"
      content="Clone to new agent"
      disabled={detailQuery.isFetching || cloneToNewAgentMutation.isPending}
      onClick={handleClone}
    />
  );
}
