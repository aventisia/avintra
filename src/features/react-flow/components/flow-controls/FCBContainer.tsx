import { Button } from "@/react-toolkit/ui/buttons/Button";
import { useDagreAutoLayout } from "../../hooks/useDagreAutoLayout";
import { ArrowDownIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { Separator } from "@/react-toolkit/ui/separator";

/**
 * Renders a container for flow control button (s).
 *
 * @param children - The child elements to be rendered inside the container.
 * @returns The rendered view controls container.
 */
export const FCBContainer = ({ children }: React.PropsWithChildren) => {
  // Auto layout the flow
  const { autoLayout } = useDagreAutoLayout();

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border bg-white p-1 shadow">
      {children}
      <Separator orientation="horizontal" className="mx-1 h-[0.5px]" />
      <Tooltip content={"Top to Bottom"} side="right">
        <Button
          size="icon6"
          onClick={() => autoLayout("TB")}
          className="rounded-md"
          variant={"ghost"}
        >
          <ArrowDownIcon className="h-4 w-4 text-[--icon-color]" />
        </Button>
      </Tooltip>
      <Tooltip content={"Left to Right"} side="right">
        <Button
          size="icon6"
          onClick={() => autoLayout("LR")}
          className="rounded-md"
          variant={"ghost"}
        >
          <ArrowRightIcon className="h-4 w-4 text-[--icon-color]" />
        </Button>
      </Tooltip>
    </div>
  );
};
