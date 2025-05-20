import { Button } from "@aventisia/ui/buttons";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { ArrowUturnRightIcon } from "@heroicons/react/24/outline";

export const FCBRedo = () => {
  return (
    <Tooltip content={"Redo"}>
      <Button size="icon6" className="rounded-md" variant={"ghost"}>
        <ArrowUturnRightIcon className="h-4 w-4 text-[--icon-color]" />
        <span className="sr-only">Redo</span>
      </Button>
    </Tooltip>
  );
};
