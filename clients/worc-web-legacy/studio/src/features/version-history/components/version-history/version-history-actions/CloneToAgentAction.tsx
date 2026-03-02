import { CopyPlus } from "lucide-react";
import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useFetchVersionHistoryDetail } from "@/features/version-history/hooks/useFetchVersionHistoryDetail";
import { useCloneToAgentMutation } from "@/features/version-history/hooks/useCloneToAgentMutation";

export default function CloneToAgentAction({ id }: { id: string }) {
  const detailQuery = useFetchVersionHistoryDetail(id);
  const cloneToNewAgentMutation = useCloneToAgentMutation();

  const handleClone = async () => {
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
