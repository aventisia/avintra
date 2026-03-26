import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/react-toolkit/ui/input-group";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { FormLabelExt } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { generateApiKey } from "../../apis/api-key-apis";

type APIKeyFieldProps = {
  value?: string;
  onChange: (value: string) => void;

  label?: string;
  readOnly?: boolean;
  disabled?: boolean;

  // inject mutation logic
  generateApiKey?: () => Promise<IHttpResponse<string>>;
  className?: string;
};

export default function APIKeyField({
  value,
  onChange,
  label = "API Key",
  readOnly = true,
  disabled = false,
  generateApiKey: generateApiKeyExternal,
  className,
}: APIKeyFieldProps) {
  const { mutate, isPending } = useMutation({
    mutationFn: generateApiKeyExternal ?? generateApiKey,
    onSuccess: (data) => {
      onChange(data?.data);
    },
  });

  const isEmpty = !value;

  return (
    <div className={cn("space-y-1", className)}>
      <FormLabelExt label={label} />

      <InputGroup
        className={cn(
          readOnly && "focus-within:border-input focus-within:ring-0",
        )}
      >
        <InputGroupInput readOnly={readOnly} value={value ?? ""} />

        <InputGroupAddon className="border-l pl-0">
          <InputGroupButton
            type="button"
            size="sm"
            className=""
            disabled={disabled || isPending}
            onClick={() => {
              console.log("first");
              mutate();
            }}
            aria-label={isEmpty ? "Generate API Key" : "Regenerate API Key"}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEmpty ? (
              <>Generate</>
            ) : (
              <>Regenerate</>
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
