import { Button } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useCarryParams } from "../../hooks/useForwardQueryParams";

/**
 * Close button for the Execution Log panel.
 * Navigates back to the `/agent` route using client-side routing,
 * preserving the current flow (`f`) and version (`v`) query params.
 */
export const ExecutionLogCloseButton = () => {
  const navigate = useNavigate();
  const withQueryParams = useCarryParams(["f", "v"]);

  const handleClose = () => {
    navigate(withQueryParams("/agent"));
  };

  return (
    <Tooltip content="Close">
      <Button variant={"ghost"} size={"icon8"} onClick={handleClose}>
        <X className="h-4 w-4" />
      </Button>
    </Tooltip>
  );
};
