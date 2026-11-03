import { IS_TAURI } from "@avplatform/ui/constants";
import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";

import { useGetVersionHistoryItemData } from "@/features/version-history/hooks/useGetVersionHistoryItemData";

export default function OpenAction({ id }: { id: string }) {
  const { agentData } = useGetVersionHistoryItemData(id);

  if (!agentData || IS_TAURI) return null;

  return (
    <SimpleDDMenuItem
      Icon={ArrowSquareOutIcon}
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
