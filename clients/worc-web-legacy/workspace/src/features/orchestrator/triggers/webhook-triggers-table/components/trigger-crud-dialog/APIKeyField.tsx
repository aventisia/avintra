import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/react-toolkit/ui/input-group";

import { FormLabelExt } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { RotateCwIcon } from "lucide-react";

export default function APIKeyField({
  readOnly = true,
}: {
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
        <InputGroupInput readOnly />
        <InputGroupAddon>
          <InputGroupButton aria-label="Copy" type="button" size="icon5">
            <Tooltip side="top" content="Regenerate">
              <RotateCwIcon className="h-3.5 w-3.5 text-muted-foreground" />
            </Tooltip>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
