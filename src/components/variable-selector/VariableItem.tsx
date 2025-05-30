import { useVariableSelectorStore } from "@/stores/variable-selector-store";
import { CommandItem } from "@aventisia/ui/command";
import { useShallow } from "zustand/react/shallow";

interface VariableItemProps {
  value: string;
}

export const VariableItem: React.FC<VariableItemProps> = ({ value }) => {
  // Get variable selector store state and actions
  const { setOpenState, setSelectedValue } = useVariableSelectorStore(
    useShallow((state) => ({
      setOpenState: state.setOpenState,
      setSelectedValue: state.setSelectedValue,
    })),
  );

  // Hanlde onValueSelect from Variable List
  const handleOnSelectValue = (val: string) => {
    setSelectedValue(val);
    setOpenState(false);
  };

  return (
    <CommandItem
      value={value}
      onSelect={(val) => {
        handleOnSelectValue(val);
      }}
      className="cursor-pointer rounded-lg px-2.5 py-1.5"
    >
      {value}
    </CommandItem>
  );
};
