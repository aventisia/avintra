import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { LogsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useCarryParams } from "../../hooks/useForwardQueryParams";

/**
 * Renders a dropdown menu item that navigates to the Execution Logs page
 * using client-side routing (no full page reload).
 *
 * Preserves the current `f` (flow) and `v` (version) query params when navigating,
 * so the execution log page can load in the correct context.
 */
export const ExecutionLogsTrigger = () => {
  const withQueryParams = useCarryParams(["f", "v"]);
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(withQueryParams("/execution-log"));
  };

  return (
    <SimpleDDMenuItem size="md" Icon={LogsIcon} content="Execution Logs" onClick={handleClick} />
  );
};
