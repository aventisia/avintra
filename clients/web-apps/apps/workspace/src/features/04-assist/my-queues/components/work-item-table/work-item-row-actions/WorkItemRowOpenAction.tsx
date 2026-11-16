import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { QueueWorkItemStatusEnum } from "@avplatform/ui/enums/queue-work-item-status-enum";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { useOpenWorkItem } from "../../../hooks/useOpenWorkItem";

interface WorkItemRowOpenActionProps {
  rowId: string;
  status: QueueWorkItemStatusEnum | string;
  isFifo?: boolean;
}

export const WorkItemRowOpenAction = ({
  rowId,
  status,
  isFifo = false,
}: WorkItemRowOpenActionProps) => {
  const navigate = useNavigate();
  const { getWorkItemUrl } = useOpenWorkItem();

  // In FIFO mode, pending items must be claimed via "Get Next Item" and cannot
  // be free-picked from the table.
  const disabled = isFifo && status === QueueWorkItemStatusEnum.Pending;

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowSquareOutIcon}
      disabled={disabled}
      onClick={() => {
        navigate(getWorkItemUrl(rowId));
      }}
    />
  );
};
