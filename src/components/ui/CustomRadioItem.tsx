import { Label } from "@aventisia/ui/label";
import { cn } from "@aventisia/ui/lib";
import { RadioGroupItem } from "@aventisia/ui/radio-group";
import React from "react";

interface BaseProps {
  value: string;
  selected: string;
  className?: string;
  radioClassName?: string;
  showRadioCircle?: boolean;
}

type CustomRadioItemProps = React.PropsWithChildren<BaseProps>;

const CustomRadioItem = ({
  value,
  selected,
  className,
  radioClassName,
  showRadioCircle = false,
  children,
}: CustomRadioItemProps) => {
  return (
    <div className="relative w-full">
      <RadioGroupItem
        value={value}
        id={value}
        className={cn(
          "absolute top-2 left-2  pointer-events-none",
          radioClassName,
          !showRadioCircle && "opacity-0",
        )}
      />
      <Label
        htmlFor={value}
        className={cn(
          "p-6 border-2 rounded-lg cursor-pointer transition-all h-full w-full",
          className,
          selected == value ? "border-primary" : "hover:border-gray-300",
        )}
      >
        {children}
      </Label>
    </div>
  );
};

export default CustomRadioItem;
