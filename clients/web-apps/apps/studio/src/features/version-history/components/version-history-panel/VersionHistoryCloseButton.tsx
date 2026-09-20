import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useCarryParams } from "../../hooks/useForwardQueryParams";

export const VersionHistoryCloseButton = () => {
  const withQueryParams = useCarryParams(["f", "v", "return"]);
  const navigate = useNavigate();

  return (
    <>
      <Tooltip content="CLose">
        <Button
          className="hover:bg-white/10"
          variant="ghost"
          size="icon8"
          onClick={() => navigate(withQueryParams("/agent"))}
        >
          <X className="h-[1.1rem] w-[1.1rem] text-white/80" />
        </Button>
      </Tooltip>
    </>
  );
};
