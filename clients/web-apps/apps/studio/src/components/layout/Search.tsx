import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { useSearchStore } from "@/features/search/stores/serach-store";

const SearchCommandTrigger = () => {
  const { setOpen } = useSearchStore(
    useShallow((state) => ({
      setOpen: state.setShowDialog,
    })),
  );

  return (
    <div className="hidden md:flex">
      <Tooltip content="Search">
        <Button
          size="icon8"
          variant="ghost"
          className="hover:bg-white/10"
          onClick={() => setOpen(true)}
        >
          <MagnifyingGlassIcon className="h-[1.1rem] w-[1.1rem] text-white/80" />
        </Button>
      </Tooltip>
    </div>
  );
};

export default SearchCommandTrigger;
