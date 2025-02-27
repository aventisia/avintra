import { CommandItem } from "@/react-toolkit/ui/command";
import { ActionToSelect } from "./ActionToSelect";
import { NodeDataType } from "@/types/node-data-type";
import { PopoverClose } from "@/react-toolkit/ui/popover";

interface ActionsListProps {
  item: NodeDataType[] | undefined;
  nodeSelectionHandler: (item: NodeDataType) => void;
}

const ActionsList = ({ item, nodeSelectionHandler }: ActionsListProps) => {
  return (
    <>
      {item?.map((action) => {
        return (
          !action.hidden && (
            <CommandItem
              disabled={action.disabled}
              key={action.name}
              value={action.label}
              className="rounded-lg p-1 hover:bg-accent"
              onSelect={() => nodeSelectionHandler(action)}
            >
              {/* Action item */}
              <PopoverClose className="text-left">
                <ActionToSelect data={action} />
              </PopoverClose>
            </CommandItem>
          )
        );
      })}
    </>
  );
};

export default ActionsList;
