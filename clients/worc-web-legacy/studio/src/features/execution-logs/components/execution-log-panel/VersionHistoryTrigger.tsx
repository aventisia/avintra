import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import { LogsIcon } from "lucide-react";

import { useCarryParams } from "../../hooks/useForwardQueryParams";

export const ExecutionLogsTrigger = () => {
  const withQueryParams = useCarryParams(["f", "v"]);
  return (
    <>
      <a
        className={cn()}
        href={
          import.meta.env.VITE_AGENTBUILDER_PATH +
          withQueryParams("execution")
        }
      >
        <SimpleDDMenuItem size="md" Icon={LogsIcon} content="Execution Logs" />
      </a>
    </>
  );
};
