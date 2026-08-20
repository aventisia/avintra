import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { useSearchStore } from "../stores/serach-store";

const SearchCommandTrigger = () => {
  const { setOpen } = useSearchStore(
    useShallow((state) => ({
      setOpen: state.setShowDialog,
    })),
  );

  return (
    <div>
      <Tooltip content="Search">
        <Button size="icon7" variant="outline" onClick={() => setOpen(true)}>
          <MagnifyingGlassIcon className="h-4 w-4 " />
        </Button>
      </Tooltip>
    </div>
  );
};

export default SearchCommandTrigger;
