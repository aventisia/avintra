import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { Redo2Icon } from "lucide-react";

export const FCBRedo = () => {
  return (
    <Tooltip content={"Redo"}>
      <Button size="icon6" className="rounded-md" variant={"ghost"}>
        <Redo2Icon className="h-4 w-4 text-[--icon-color]" />
        <span className="sr-only">Redo</span>
      </Button>
    </Tooltip>
  );
};
