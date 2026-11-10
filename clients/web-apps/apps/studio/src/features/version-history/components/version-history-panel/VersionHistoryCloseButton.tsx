import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { XIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { useCarryParams } from "../../hooks/useForwardQueryParams";

export const VersionHistoryCloseButton = () => {
  const withQueryParams = useCarryParams(["f", "v", "return"]);
  const navigate = useNavigate();

  return (
    <>
      <Tooltip content="CLose">
        <Button
          className="hover:bg-hover"
          variant="ghost"
          size="icon8"
          onClick={() => navigate(withQueryParams("/agent"))}
        >
          <XIcon className="h-[1.1rem] w-[1.1rem] text-ink-2" />
        </Button>
      </Tooltip>
    </>
  );
};
