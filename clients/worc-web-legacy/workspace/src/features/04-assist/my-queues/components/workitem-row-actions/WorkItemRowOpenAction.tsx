import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import { QueueWorkItemStatusEnum } from "@/react-toolkit/enums/queue-work-item-status-enum";

import { useOpenWorkItem } from "../../hooks/useOpenWorkItem";

interface WorkItemRowOpenActionProps {
  rowId: string;
  status: QueueWorkItemStatusEnum | string;
}

export const WorkItemRowOpenAction = ({
  rowId,
}: WorkItemRowOpenActionProps) => {
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
