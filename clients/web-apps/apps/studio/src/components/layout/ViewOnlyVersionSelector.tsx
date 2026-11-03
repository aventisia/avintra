import { Button } from "@avplatform/ui/buttons";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { useReactFlowViewStore } from "@/stores/react-flow-view-store";

function ViewOnlyVersionSelector() {
  const { versionNumber } = useReactFlowViewStore(
    useShallow((state) => ({ versionNumber: state.versionNumber })),
  );

  return (
    <Button
      variant={"ghost"}
      size={"xs"}
      className="max-w-[15rem] gap-1 px-1.5 font-mono font-normal text-muted-foreground disabled:bg-transparent"
      disabled
    >
      <span className="min-w-0 truncate">v{versionNumber} </span>
      <CaretDownIcon className="size-3 shrink-0" />
    </Button>
  );
}

export default ViewOnlyVersionSelector;
