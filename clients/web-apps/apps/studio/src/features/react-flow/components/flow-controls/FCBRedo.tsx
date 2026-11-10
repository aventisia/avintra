import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ArrowUUpRightIcon } from "@phosphor-icons/react";

export const FCBRedo = () => {
  return (
    <Tooltip content={"Redo"}>
      <Button size="icon6" className="rounded-md" variant={"ghost"}>
        <ArrowUUpRightIcon className="h-4 w-4 text-[--icon-color]" />
        <span className="sr-only">Redo</span>
      </Button>
    </Tooltip>
  );
};
