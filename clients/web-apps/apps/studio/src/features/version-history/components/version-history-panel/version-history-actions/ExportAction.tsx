import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { UploadSimpleIcon } from "@phosphor-icons/react";

import { useExportVersionHistoryItem } from "@/features/version-history/hooks/useExportVersionHistoryItem";
import { useFetchVersionHistoryDetail } from "@/features/version-history/hooks/useFetchVersionHistoryDetail";

export default function ExportAction({ id }: { id: string }) {
  const detailQuery = useFetchVersionHistoryDetail(id);
  const { exportVersionHistoryFlow } = useExportVersionHistoryItem();

  const handleExport = async () => {
    const { data } = await detailQuery.refetch();
    if (!data) return;

    exportVersionHistoryFlow(data);
  };

  return (
    <SimpleDDMenuItem Icon={UploadSimpleIcon} size="sm" content="Export" onClick={handleExport} />
  );
}
