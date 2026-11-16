import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { toast } from "@avplatform/ui/sonner";
import { CopyIcon } from "@phosphor-icons/react";

import { useCloneToVersionMutation } from "@/features/version-history/hooks/useCloneToVersionMutation";
import { useFetchVersionHistoryDetail } from "@/features/version-history/hooks/useFetchVersionHistoryDetail";

export default function CloneToVersionAction({ id }: { id: string }) {
  const detailQuery = useFetchVersionHistoryDetail(id);
  const cloneToNewVersionMutation = useCloneToVersionMutation();

  const handleClone = async () => {
    try {
      const { data } = await detailQuery.refetch();
      if (!data) {
        toast.error("Unable to load version details. Please try again.");
        return;
      }

      cloneToNewVersionMutation.mutate(data);
    } catch {
      toast.error("Clone failed. Please try again.");
    }
  };

  return (
    <SimpleDDMenuItem
      Icon={CopyIcon}
      size="sm"
      content="Clone to new version"
      disabled={detailQuery.isFetching || cloneToNewVersionMutation.isPending}
      onClick={handleClone}
    />
  );
}
