import { Tooltip } from "@aventisia/ui/tooltip";
import { HistoryIcon } from "lucide-react";
import { Button, buttonVariants } from "@aventisia/ui/buttons";
import { useCarryParams } from "../../hooks/useForwardQueryParams";
import { cn } from "@aventisia/ui/lib";
import { useFetchVersionHistoryList } from "../../hooks/useFetchVersionHistoryList";
import { toast } from "@aventisia/ui/sonner";

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
              import.meta.env.VITE_AGENTBUILDER_PATH +
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
