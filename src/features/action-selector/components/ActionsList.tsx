import { CommandItem } from "@aventisia/ui/command";
import { ActionToSelect } from "./ActionToSelect";
import { NodeDataType } from "@/types/node-data-type";
import { DialogClose } from "@aventisia/ui/dialog";

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
              <DialogClose className="text-left">
                <ActionToSelect data={action} />
              </DialogClose>
            </CommandItem>
          )
        );
      })}
    </>
  );
};

export default ActionsList;
