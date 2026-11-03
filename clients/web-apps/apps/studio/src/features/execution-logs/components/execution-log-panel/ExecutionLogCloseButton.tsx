import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { XIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { useCarryParams } from "../../hooks/useForwardQueryParams";

/**
 * Close button for the Execution Log panel.
 * Navigates back to the `/agent` route using client-side routing,
 * preserving the current flow (`f`) and version (`v`) query params.
 */
export const ExecutionLogCloseButton = () => {
  const navigate = useNavigate();
  const withQueryParams = useCarryParams(["f", "v", "return"]);

  const handleClose = () => {
    navigate(withQueryParams("/agent"));
  };

  return (
    <Tooltip content="Close">
      <Button variant={"ghost"} size={"icon8"} onClick={handleClose}>
        <XIcon className="h-4 w-4" />
      </Button>
    </Tooltip>
  );
};
