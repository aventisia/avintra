import { useArchiveAgentAction } from "@avplatform/agents";
import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArchiveIcon, TrayArrowUpIcon } from "@phosphor-icons/react";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { FLOWS_QUERY_KEY, FOLDERS_QUERY_KEY } from "../../constants";

type FlowRowArchiveActionProps = {
  rowId: string;
  name: string;
  isArchived: boolean;
  isPublished: boolean;
};

/**
 * Archive action of an agent, or Unarchive while the agent is archived; both ask
 * for confirmation and a blocked archive explains itself instead of archiving.
 */
export const FlowRowArchiveAction = ({
  rowId,
  name,
  isArchived,
  isPublished,
}: FlowRowArchiveActionProps) => {
  const { requestArchive, requestUnarchive } = useArchiveAgentAction({
    client: axiosInstance,
    getSpaceHeaders,
    refreshQueryKeys: [FLOWS_QUERY_KEY, FOLDERS_QUERY_KEY],
  });

  const agent = { id: rowId, name, isPublished };

  if (isArchived) {
    return (
      <SimpleDDMenuItem
        Icon={TrayArrowUpIcon}
        content="Unarchive"
        onClick={() => requestUnarchive(agent)}
      />
    );
  }

  return (
    <SimpleDDMenuItem Icon={ArchiveIcon} content="Archive" onClick={() => requestArchive(agent)} />
  );
};
