import { Button } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { X } from "lucide-react";

export const ExecutionLogCloseButton = () => {
  return (
    <>
      <Tooltip content="CLose">
        <Button
          variant={"ghost"}
          size={"icon8"}
          onClick={() => window.history.back()}
        >
          <X className="h-4 w-4" />
        </Button>
      </Tooltip>
    </>
  );
};
