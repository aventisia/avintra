import { Copy } from "lucide-react";
import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useFetchVersionHistoryDetail } from "@/features/version-history/hooks/useFetchVersionHistoryDetail";
import { useCloneToVersionMutation } from "@/features/version-history/hooks/useCloneToVersionMutation";

export default function CloneToVersionAction({ id }: { id: string }) {
  const detailQuery = useFetchVersionHistoryDetail(id);
  const cloneToNewVersionMutation = useCloneToVersionMutation();

  const handleClone = async () => {
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
