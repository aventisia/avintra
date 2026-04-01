import { Upload } from "lucide-react";
import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useFetchVersionHistoryDetail } from "@/features/version-history/hooks/useFetchVersionHistoryDetail";
import { useExportVersionHistoryItem } from "@/features/version-history/hooks/useExportVersionHistoryItem";

export default function ExportAction({ id }: { id: string }) {
  const detailQuery = useFetchVersionHistoryDetail(id);
  const { exportVersionHistoryFlow } = useExportVersionHistoryItem();

  const handleExport = async () => {
    const { data } = await detailQuery.refetch();
    if (!data) return;

    exportVersionHistoryFlow(data);
  };

  return (
    <SimpleDDMenuItem
      Icon={Upload}
      size="sm"
      content="Export"
      onClick={handleExport}
    />
  );
}
