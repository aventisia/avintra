// components/SearchMultiSelect/SelectRole.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { EyeIcon, PencilSimpleIcon } from "@phosphor-icons/react";

import { selectOptions } from "../../constants";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export const SelectType: React.FC<Props> = ({ value, onChange }) => {
  const selectedLabel = selectOptions.find((opt) => opt.value === value)?.label || "Select";

  const iconMapper: { [key: string]: JSX.Element } = {
    Viewer: <EyeIcon className="h-3 w-3" />,
    Editor: <PencilSimpleIcon className="h-3 w-3" />,
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[7.5rem]" size="base">
        <SelectValue>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent className="-ml-11">
        {selectOptions.map((item) => (
          <SelectItem key={item.value} value={item.value} size="sm">
            <div className="flex items-center gap-2">
              {iconMapper[item.value]}
              <div className="flex flex-col">
                <p className="text-2xs font-medium">{item.label}</p>
                <span className="text-3xs text-muted-foreground">{item.description}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
