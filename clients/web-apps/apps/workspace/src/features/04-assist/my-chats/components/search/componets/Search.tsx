import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { SearchIcon } from "lucide-react";
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
          <SearchIcon className="h-4 w-4 " />
        </Button>
      </Tooltip>
    </div>
  );
};

export default SearchCommandTrigger;
