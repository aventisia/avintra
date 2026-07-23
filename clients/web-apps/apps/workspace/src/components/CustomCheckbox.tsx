import { Checkbox } from "@avplatform/ui";
import { Label } from "@avplatform/ui/label";

export default function CustomCheckbox({
  checked,
  disabled,
  onCheckedChange,
  label,
  description,
}: {
  checked: boolean;
  onCheckedChange?(checked: boolean): void;
  disabled?: boolean;
  label: string;
  description?: string;
}) {
  return (
    <Label
      className="flex items-start gap-2 rounded-lg border p-3 hover:bg-accent/50 
              data-[state=checked]:border-primary/48 data-[state=checked]:bg-accent/50"
    >
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />

      <div className="flex flex-col gap-1">
        <p>{label}</p>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </div>
    </Label>
  );
}
