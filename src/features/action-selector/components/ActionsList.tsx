import { CommandItem } from "@/react-toolkit/ui/command";
import { ActionToSelect } from "./ActionToSelect";
import { NodeDataType } from "@/types/node-data-type";

interface ActionsListProps {
  item: NodeDataType[] | undefined;
  nodeSelectionHandler: (item: NodeDataType) => void;
}

const ActionsList = ({ item, nodeSelectionHandler }: ActionsListProps) => {
  return (
    <>
      {item?.map((action) => (
        <CommandItem
          key={action.name}
          value={action.label}
          className="rounded-lg p-1 hover:bg-accent"
          onSelect={() => nodeSelectionHandler(action)}
        >
          {/* Action item */}
          <ActionToSelect data={action} />
        </CommandItem>
      ))}
    </>
  );
};

export default ActionsList;
