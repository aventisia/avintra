import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useNavigate } from "react-router-dom";

import { TABLE_TAB_QUERY_PARAM } from "../../constants";
import { useTableTab } from "../../hooks/useTableTab";

interface OpenQueueRowActionProps {
  rowId: string;
  name: string;
  size?: "sm" | "md";
}

export const OpenQueueRowAction: React.FC<OpenQueueRowActionProps> = ({
  rowId,
  name,
  size = "md",
}) => {
  const navigate = useNavigate();

  // Use to handle Personal/Shared tabs list
  const { currentTab } = useTableTab();

  return (
    <SimpleDDMenuItem
      size={size}
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => {
        navigate(
          `/configure/queues/work-items/${rowId}?${TABLE_TAB_QUERY_PARAM}=${currentTab}&name=${name}`,
        );
      }}
    />
  );
};
