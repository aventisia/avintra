import { cn } from "@avplatform/ui/lib";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CurrencySelect = ({ value, onChange, className }: CurrencySelectProps) => {
  return (
    <Select defaultValue="USD" value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-32", className)}>
        <SelectValue placeholder="Select Currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="USD">USD ($)</SelectItem>
        <SelectItem value="INR">INR (₹)</SelectItem>
        <SelectItem value="EUR">EUR (€)</SelectItem>
        <SelectItem value="GBP">GBP (£)</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default CurrencySelect;
