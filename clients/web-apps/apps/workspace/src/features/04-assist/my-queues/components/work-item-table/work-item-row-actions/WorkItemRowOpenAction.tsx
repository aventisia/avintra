import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { QueueWorkItemStatusEnum } from "@avplatform/ui/enums/queue-work-item-status-enum";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import { useOpenWorkItem } from "../../../hooks/useOpenWorkItem";

interface WorkItemRowOpenActionProps {
  rowId: string;
  status: QueueWorkItemStatusEnum | string;
}

export const WorkItemRowOpenAction = ({ rowId }: WorkItemRowOpenActionProps) => {
  const navigate = useNavigate();
  const { getWorkItemUrl } = useOpenWorkItem();
  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => {
        navigate(getWorkItemUrl(rowId));
      }}
    />
  );
};
