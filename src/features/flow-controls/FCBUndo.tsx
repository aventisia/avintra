import { Button, Tooltip } from "@/react-toolkit/components/ui";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

export const FCBUndo = () => {
  return (
    <Tooltip content={"Undo"}>
      <Button size="icon8" className="rounded-md" variant={"ghost"}>
        <ArrowUturnLeftIcon className="h-4 w-4 text-[--icon-color]" />
        <span className="sr-only">Undo</span>
      </Button>
    </Tooltip>
  );
};
