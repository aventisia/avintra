import { DropdownMenuTrigger } from "@avplatform/ui/dropdown-menu";
import { DotsThreeIcon } from "@phosphor-icons/react";

export const FVIActionsTrigger = () => {
  return (
    <DropdownMenuTrigger
      aria-label="Version actions"
      className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-muted hover:text-ink-2 focus-visible:ring-2 focus-visible:ring-focus data-[state=open]:bg-muted data-[state=open]:text-ink-2"
    >
      <DotsThreeIcon className="size-4" />
    </DropdownMenuTrigger>
  );
};

FVIActionsTrigger.displayName = "FVIActionsTrigger";
