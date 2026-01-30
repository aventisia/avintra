import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useNavigate } from "react-router-dom";

interface OpenQueueRowActionProps {
  rowId: string;
  size?: "sm" | "md";
}

export const OpenQueueRowAction: React.FC<OpenQueueRowActionProps> = ({
  rowId,
  size = "md",
}) => {
  const navigate = useNavigate();
  return (
    <SimpleDDMenuItem
      size={size}
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => {
        navigate(`/orchestrator/queues/work-items/${rowId}`);
      }}
    />
  );
};
