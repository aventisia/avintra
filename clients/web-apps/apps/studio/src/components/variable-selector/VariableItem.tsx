import { CommandItem } from "@avplatform/ui/command";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { useVariableSelectorStore } from "@/stores/variable-selector-store";

interface VariableItemProps {
  value: string;
  Icon: PhosphorIcon;
  isConfigValue?: boolean;
}

export const VariableItem: React.FC<VariableItemProps> = ({
  value,
  Icon,
  isConfigValue = false,
}) => {
  const { setOpenState, setSelectedValue } = useVariableSelectorStore(
    useShallow((state) => ({
      setOpenState: state.setOpenState,
      setSelectedValue: state.setSelectedValue,
    })),
  );

  const handleSelect = () => {
    setSelectedValue(isConfigValue ? "__config__" + value : value);
    setOpenState(false);
  };

  return (
    <CommandItem
      value={value}
      onSelect={handleSelect}
      title={value}
      className="group/item cursor-pointer gap-2 rounded-md px-2 py-1.5"
    >
      <Icon className="size-3.5 shrink-0 text-muted-foreground group-aria-selected/item:text-primary-text" />
      <span className="min-w-0 truncate font-mono text-[12px]">{value}</span>
    </CommandItem>
  );
};
