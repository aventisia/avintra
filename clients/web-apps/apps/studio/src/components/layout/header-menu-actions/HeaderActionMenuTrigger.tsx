import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuTrigger } from "@avplatform/ui/dropdown-menu";
import { Tooltip } from "@avplatform/ui/tooltip";
import { DotsThreeIcon } from "@phosphor-icons/react";

export const HeaderActionMenuTrigger = () => {
  return (
    <Tooltip content="More">
      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon7" })}>
        <DotsThreeIcon className="size-4" />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
    </Tooltip>
  );
};
