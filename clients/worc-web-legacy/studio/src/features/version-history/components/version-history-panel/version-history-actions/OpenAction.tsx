import { IS_TAURI } from "@/constants";
import { useGetVersionHistoryItemData } from "@/features/version-history/hooks/useGetVersionHistoryItemData";

import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ExternalLink } from "lucide-react";

export default function OpenAction({ id }: { id: string }) {
  const { agentData } = useGetVersionHistoryItemData(id);

  if (!agentData || IS_TAURI) return null;

  return (
    <SimpleDDMenuItem
      Icon={ExternalLink}
      size="sm"
      content="Open in new tab"
      onClick={() => {
        window.open(
          `${import.meta.env.VITE_STUDIO_PATH}agent-history?f=${agentData.flowId}&v=${agentData.flowVersionId}&h=${agentData.id}`,
          "_blank",
        );
      }}
    />
  );
}
