import { Button } from "@avplatform/ui/buttons";
import { ChevronDownIcon } from "lucide-react";
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
      className={
        "group h-7 max-w-[15rem] shrink-0 gap-2 rounded-full bg-white/10 pl-3 pr-2.5 font-bold text-white/80 hover:bg-white/20 hover:text-white/80"
      }
      disabled
    >
      <span className="min-w-0 truncate">v{versionNumber} </span>
      <ChevronDownIcon className={"h-3 w-3 shrink-0 min-w-3 transition-all group-hover:mt-0.5"} />
    </Button>
  );
}

export default ViewOnlyVersionSelector;
