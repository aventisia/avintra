import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@avplatform/ui/components/input-group";
import { FormLabelExt } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useState } from "react";

export default function InputWithCopy({
  readOnly = true,
  value,
  onChange,
  disabled,
  label,
  description,
}: {
  value?: string;
  onChange: (value: string) => void;

  label?: string;
  description?: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value ?? "");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div>
      <FormLabelExt label={label} description={description} />
      <InputGroup
        className={cn("mt-1", readOnly && "focus-within:border-input focus-within:ring-0")}
      >
        <InputGroupInput
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          readOnly
          disabled={disabled}
        />
        <InputGroupAddon>
          <InputGroupButton
            aria-label="Copy"
            type="button"
            size="sm"
            onClick={() => {
              handleCopy();
            }}
            disabled={false}
          >
            {isCopied ? (
              <CheckIcon className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <CopyIcon className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
