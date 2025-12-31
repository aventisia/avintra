import { CommandItem } from "@aventisia/ui/command";
import { useShallow } from "zustand/react/shallow";

import { ModelVersionDto } from "../../dtos/model-version-dto";
import { useOpenModel } from "../../hooks/useOpenModel";
import { useVersionPopoverStore } from "../../stores/model-version-popover-store";
import { useMlModelVersionsStore } from "../../stores/model-versions-store";
import MVItem from "./MVItem";

interface MVListProps {
  modelVersionsList: ModelVersionDto[] | undefined;
}

export const MVList = ({ modelVersionsList }: MVListProps) => {
  // Get store state and actions
  const { togglePopoverOpen } = useVersionPopoverStore(
    useShallow((state) => ({
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );
  // Get handle function to open model
  const handleOpenModelAction = useOpenModel();

  // Get store state and actions
  const { setVersion } = useMlModelVersionsStore(
    useShallow((state) => ({
      setVersion: state.setVersion,
    })),
  );

  return (
    <>
      {modelVersionsList?.map((item) => (
        <CommandItem
          key={item.id}
          value={`Version ${item.versionNumber}`}
          className="group/CommandItem cursor-pointer rounded-lg p-1"
          onSelect={() => {
            handleOpenModelAction(item.aiProjectId, item.name, item.id);
            setVersion(item.id || "", item.versionNumber || null);
            // Close the popover
            togglePopoverOpen(false);
          }}
        >
          {/* Version item */}
          <MVItem modelVersion={item} />
        </CommandItem>
      ))}
    </>
  );
};
