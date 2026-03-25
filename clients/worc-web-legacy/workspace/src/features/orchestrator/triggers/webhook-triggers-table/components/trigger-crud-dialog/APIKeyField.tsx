import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/react-toolkit/ui/input-group";

import { FormLabelExt } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";

export default function APIKeyField({
  value="aer12",
  readOnly = true,
}: {
  value: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <FormLabelExt label="API Key" />
      <InputGroup
        className={cn(
          "mt-1",
          readOnly && "focus-within:border-input focus-within:ring-0",
        )}
      >
        <InputGroupInput readOnly value={value} />
        <InputGroupAddon>
          {value ? (
            <InputGroupButton aria-label="Regenerate" type="button" size="sm">
              Regenerate
            </InputGroupButton>
          ) : (
            <InputGroupButton aria-label="Generate" type="button" size="sm">
              Generate
            </InputGroupButton>
          )}{" "}
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
