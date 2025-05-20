import { CommandItem } from "@/react-toolkit/ui/command";
import { useVariableSelectorInputStore } from "@/stores/variable-selector-input-value-store";
import { useShallow } from "zustand/react/shallow";

interface VariablesListProps {
  variableList: string[]; // List of strings (variables)
  togglePopover: React.Dispatch<React.SetStateAction<boolean>>;
}

export const VariablesList: React.FC<VariablesListProps> = ({
  variableList,
  togglePopover,
}) => {
  const { setSelectedValue } = useVariableSelectorInputStore(
    useShallow((state) => ({
      setSelectedValue: state.setSelectedValue,
    })),
  );

  // Hanlde onValueSelect from Variable List
  const handleOnSelectValue = (val: string) => {
    setSelectedValue("");
    setSelectedValue(val);
    togglePopover(false);
  };

  return (
    <>
      {variableList?.map((item, idx) => (
        <CommandItem
          key={idx}
          value={item}
          onSelect={(val) => {
            handleOnSelectValue(val);
          }}
          className="group/CommandItem mb-2.5 cursor-pointer rounded-lg bg-secondary-light px-2 py-1.5"
        >
          {/* flow item */}
          <p>{item}</p>
        </CommandItem>
      ))}
    </>
  );
};
