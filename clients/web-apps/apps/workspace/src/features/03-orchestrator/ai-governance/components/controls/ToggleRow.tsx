import { Switch } from "@avplatform/ui";

interface ToggleRowProps {
  label: string;
  clause?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * A labelled switch row used for boolean governance fields.
 */
export const ToggleRow = ({ label, clause, checked, onChange }: ToggleRowProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div>
        <div className="text-[13px] font-medium">{label}</div>
        {clause && <div className="mt-0.5 text-[10.5px] text-muted-foreground">{clause}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
};
