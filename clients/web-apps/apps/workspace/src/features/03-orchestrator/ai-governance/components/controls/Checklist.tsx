import { Checkbox } from "@avplatform/ui";

export interface ChecklistItem {
  key: string;
  label: string;
}

interface ChecklistProps {
  items: ChecklistItem[];
  values: Record<string, boolean>;
  onChange: (key: string, checked: boolean) => void;
}

/**
 * A vertical checklist of checkboxes bound to a boolean record.
 */
export const Checklist = ({ items, values, onChange }: ChecklistProps) => {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <label
          key={item.key}
          className="flex cursor-pointer items-start gap-2.5 text-[13px] text-muted-foreground"
        >
          <Checkbox
            checked={!!values[item.key]}
            onCheckedChange={(checked) => onChange(item.key, !!checked)}
            className="mt-0.5"
          />
          <span>{item.label}</span>
        </label>
      ))}
    </div>
  );
};
