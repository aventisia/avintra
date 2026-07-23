import { Label } from "@avplatform/ui/label";
import { cn } from "@avplatform/ui/lib";
import { RadioGroupItem } from "@avplatform/ui/radio-group";
import React from "react";

interface BaseProps {
  value: string;
  selected: string;
  className?: string;
  radioClassName?: string;
  showRadioCircle?: boolean;
  highlightSelected?: boolean;
}

type CustomRadioItemProps = React.PropsWithChildren<BaseProps>;

const CustomRadioItem = ({
  value,
  selected,
  className,
  radioClassName,
  showRadioCircle = false,
  highlightSelected = true,
  children,
}: CustomRadioItemProps) => {
  return (
    <div className="relative w-full">
      <RadioGroupItem
        value={value}
        id={value}
        className={cn(
          "pointer-events-none absolute left-2 top-2",
          radioClassName,
          !showRadioCircle && "opacity-0",
        )}
      />
      <Label
        htmlFor={value}
        className={cn(
          "h-full w-full rounded-lg border-2 p-6 transition-all",
          className,
          highlightSelected && "cursor-pointer",
          highlightSelected && (selected == value ? "border-primary" : "hover:border-gray-300"),
        )}
      >
        {children}
      </Label>
    </div>
  );
};

export default CustomRadioItem;
