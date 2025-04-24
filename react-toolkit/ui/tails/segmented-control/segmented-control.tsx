import { useCallback, useEffect, useState } from "react";

import { clsxMerge } from "@/react-toolkit/utils";

import { SegmentedControlItem, SegmentedControlItemProps } from "./segmented-control-item";

export interface SegmentedControlProps {
  /** Custom className. */
  className?: string;
  /** Current value. */
  value?: string;
  /** Callback on change. */

  renderOption?: (
    option: Omit<SegmentedControlItemProps, "isActive">,
  ) => React.ReactNode;

  onChange?: (value: string) => void;
  /** List of items. */
  items: Omit<SegmentedControlItemProps, "isActive">[];
}

export function SegmentedControl({
  items,
  onChange,
  renderOption,
  value,
  className,
}: Readonly<SegmentedControlProps>) {
  const [activeItem, setActiveItem] = useState(
    items.find((item) => item.value === value)?.value,
  );

  const handleChange = useCallback(
    (value: string) => {
      if (value === activeItem) {
        return;
      }

      onChange?.(value);

      setActiveItem(value);
    },
    [activeItem, onChange],
  );

  useEffect(() => {
    const itemValue = items.find((item) => item.value === value)?.value;
    if (itemValue) {
      setActiveItem(itemValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div
      className={clsxMerge(
        "inline-flex w-full items-baseline justify-stretch rounded-lg bg-primary-50",
        "transition-transform delay-75",
        className,
      )}
    >
      {items.map((item) => (
        <>
          {renderOption ? (
            renderOption(item)
          ) : (
            <SegmentedControlItem
              key={item.value}
              onChange={handleChange}
              isActive={activeItem === item.value}
              {...item}
            />
          )}
        </>
      ))}
    </div>
  );
}

SegmentedControl.displayName = "SegmentedControl";
