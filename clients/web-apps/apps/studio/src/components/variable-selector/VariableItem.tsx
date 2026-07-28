import { useVariableSelectorStore } from "@/stores/variable-selector-store";
import { CommandItem } from "@avplatform/ui/command";
import { useShallow } from "zustand/react/shallow";

interface VariableItemProps {
  value: string;
  isConfigValue?: boolean;
}

export const VariableItem: React.FC<VariableItemProps> = ({
  value,
  isConfigValue = false,
}) => {
  // Get variable selector store state and actions
  const { setOpenState, setSelectedValue } = useVariableSelectorStore(
    useShallow((state) => ({
      setOpenState: state.setOpenState,
      setSelectedValue: state.setSelectedValue,
    })),
  );

  // Handle onValueSelect from Variable List
  const handleOnSelectValue = (val: string) => {
    setSelectedValue(isConfigValue ? "__config__" + val : val);
    setOpenState(false);
  };

  return (
    <CommandItem
      value={value}
      onSelect={() => {
        handleOnSelectValue(value);
      }}
      className="cursor-pointer rounded-lg px-2.5 py-1.5"
    >
      {value}
    </CommandItem>
  );
};
