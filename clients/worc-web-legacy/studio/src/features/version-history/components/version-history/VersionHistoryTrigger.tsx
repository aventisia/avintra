import { Tooltip } from "@aventisia/ui/tooltip";
import { HistoryIcon } from "lucide-react";
import { Button } from "@aventisia/ui/buttons";
import { useNavigate } from "react-router-dom";
import { useCarryParams } from "../../hooks/useForwardQueryParams";

export const VersionHistoryTrigger = () => {
  // Get navigate function
  const navigate = useNavigate();

  const withQueryParams = useCarryParams(["f", "v"]);

  return (
    <>
      <Tooltip content="Change History">
        <Button
          size="icon8"
          variant="ghost"
          className="hover:bg-white/10"
          onClick={() => navigate(withQueryParams("/agent-history"))}
        >
          <HistoryIcon className="h-[1.1rem] w-[1.1rem] text-white/80" />
        </Button>
      </Tooltip>
    </>
  );
};
