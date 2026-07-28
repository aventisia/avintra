import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

export const FCBUndo = () => {
  return (
    <Tooltip content={"Undo"}>
      <Button size="icon6" className="rounded-md" variant={"ghost"}>
        <ArrowUturnLeftIcon className="h-4 w-4 text-[--icon-color]" />
        <span className="sr-only">Undo</span>
      </Button>
    </Tooltip>
  );
};
