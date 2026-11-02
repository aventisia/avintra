import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { Undo2Icon } from "lucide-react";

export const FCBUndo = () => {
  return (
    <Tooltip content={"Undo"}>
      <Button size="icon6" className="rounded-md" variant={"ghost"}>
        <Undo2Icon className="h-4 w-4 text-[--icon-color]" />
        <span className="sr-only">Undo</span>
      </Button>
    </Tooltip>
  );
};
