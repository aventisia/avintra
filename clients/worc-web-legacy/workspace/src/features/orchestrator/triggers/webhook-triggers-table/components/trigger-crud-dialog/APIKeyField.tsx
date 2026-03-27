import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/react-toolkit/ui/input-group";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { FormLabelExt } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { CrudActionType } from "@aventisia/ui/types";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { generateApiKey } from "../../apis/api-key-apis";

type APIKeyFieldProps = {
  value?: string;
  onChange: (value: string) => void;

  label?: string;
  readOnly?: boolean;
  disabled?: boolean;
  crudAction: CrudActionType;
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
  crudAction,
}: APIKeyFieldProps) {
  const [generated, setGenerated] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: generateApiKeyExternal ?? generateApiKey,
    onSuccess: (data) => {
      onChange(data?.data);
      setGenerated(true);
    },
  });

  const isCreate = crudAction === "create";
  // const isUpdate = crudAction === "update";

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value ?? "");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className={cn("space-y-1", className)}>
      <FormLabelExt label={label} isRequired />

      <InputGroup
        className={cn(
          readOnly && "focus-within:border-input focus-within:ring-0",
        )}
      >
        <InputGroupInput readOnly value={value ?? ""} />

        <InputGroupAddon className="">
          {/* BEFORE GENERATION (BASED ON CRUD) */}
          {!generated && (
            <InputGroupButton
              type="button"
              size="sm"
              disabled={disabled || isPending}
              onClick={() => mutate()}
              aria-label={isCreate ? "Generate API Key" : "Regenerate API Key"}
            >
              {isCreate ? "Generate" : "Regenerate"}
            </InputGroupButton>
          )}

          {/* AFTER GENERATION */}
          {generated && (
            <InputGroupButton
              type="button"
              size="sm"
              disabled={!value}
              onClick={() => {
                handleCopy();
              }}
            >
              {isCopied ? (
                <CheckIcon className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <CopyIcon className="h-3.5 w-3.5 text-muted-foreground" />
              )}{" "}
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>

      {/* MESSAGE */}
      {generated && (
        <p className="text-xs text-muted-foreground">
          This API key is displayed only once. Copy and store it securely — it
          cannot be retrieved later.
        </p>
      )}
    </div>
  );
}
