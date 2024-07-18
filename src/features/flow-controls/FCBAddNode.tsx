import { Button, Tooltip } from "@/react-toolkit/components/ui";
import { PlusIcon } from "@heroicons/react/24/outline";

export const FCBAddNode = () => {
  return (
    <Tooltip content="Add activity">
      <Button size="icon8" className="rounded-md" variant={"ghost"}>
        <PlusIcon className="h-4 w-4 text-[--icon-color]" />
        <span className="sr-only">Open menu</span>
      </Button>
    </Tooltip>
  );
};
