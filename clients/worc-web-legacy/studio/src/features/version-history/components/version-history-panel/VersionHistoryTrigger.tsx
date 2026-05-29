import { Button, buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { toast } from "@aventisia/ui/sonner";
import { Tooltip } from "@aventisia/ui/tooltip";
import { HistoryIcon } from "lucide-react";

import { useFetchVersionHistoryList } from "../../hooks/useFetchVersionHistoryList";
import { useCarryParams } from "../../hooks/useForwardQueryParams";

export const VersionHistoryTrigger = () => {
  const withQueryParams = useCarryParams(["f", "v"]);
  const { data } = useFetchVersionHistoryList();
  return (
    <>
      <Tooltip content="Change History">
        {data?.data && data.data?.length > 0 ? (
          <a
            className={cn(
              buttonVariants({
                variant: "ghost",
                size: "icon8",
                className: "hover:bg-white/10",
              }),
            )}
            href={
              import.meta.env.VITE_STUDIO_PATH +
              withQueryParams("agent-history")
            }
          >
            <HistoryIcon className="h-[1.1rem] w-[1.1rem] text-white/80" />
          </a>
        ) : (
          <Button
            className="hover:bg-white/10"
            variant={"ghost"}
            size={"icon8"}
          >
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
