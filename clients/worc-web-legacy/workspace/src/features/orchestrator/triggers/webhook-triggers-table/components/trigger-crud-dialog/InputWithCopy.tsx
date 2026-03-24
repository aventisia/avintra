import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/react-toolkit/ui/input-group";

import { FormLabelExt } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

export default function InputWithCopy({
  readOnly = true,
  value,
}: {
  value?: string;
  readOnly?: boolean;
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
      <FormLabelExt label="Webhook URL" />
      <InputGroup
        className={cn(
          "mt-1",
          readOnly && "focus-within:border-input focus-within:ring-0",
        )}
      >
        <InputGroupInput value={value} readOnly />
        <InputGroupAddon>
          <InputGroupButton
            aria-label="Copy"
            type="button"
            size="icon5"
            onClick={() => {
              handleCopy();
            }}
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
