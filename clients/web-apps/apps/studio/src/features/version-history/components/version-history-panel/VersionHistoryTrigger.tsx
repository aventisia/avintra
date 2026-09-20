import { Button } from "@avplatform/ui/buttons";
import { toast } from "@avplatform/ui/sonner";
import { Tooltip } from "@avplatform/ui/tooltip";
import { HistoryIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useFetchVersionHistoryList } from "../../hooks/useFetchVersionHistoryList";
import { useCarryParams } from "../../hooks/useForwardQueryParams";

export const VersionHistoryTrigger = () => {
  const withQueryParams = useCarryParams(["f", "v", "return"]);
  const navigate = useNavigate();
  const { data } = useFetchVersionHistoryList();
  return (
    <>
      <Tooltip content="Change History">
        {data?.data && data.data?.length > 0 ? (
          <Button
            className={"hover:bg-white/10 hidden md:flex"}
            variant={"ghost"}
            size={"icon8"}
            onClick={() => navigate(withQueryParams("/agent-history"))}
          >
            <HistoryIcon className="h-[1.1rem] w-[1.1rem] text-white/80" />
          </Button>
        ) : (
          <Button className="hover:bg-white/10 hidden md:flex" variant={"ghost"} size={"icon8"}>
            <HistoryIcon
              className="h-[1.1rem] w-[1.1rem] text-white/80"
              onClick={() => {
                toast.info("No change history present");
              }}
            />
          </Button>
        )}
      </Tooltip>
    </>
  );
};
