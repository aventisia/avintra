/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input, NoContentMessage } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import {
  BaseFieldProps,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { FormFieldSizeType } from "@avplatform/ui/types";
import { CircleOffIcon, Plus, X } from "lucide-react";
import { KeyboardEvent, useRef, useState } from "react";
import {
  FieldPath,
  FieldValues,
  useFormContext,
  useWatch,
} from "react-hook-form";

interface StringArrayFieldProps extends BaseFieldProps {
  name: FieldPath<FieldValues>;
  disabled?: boolean;
  label?: string;
  keyword?: string;
  isRequired?: boolean;
  description?: string;
  size?: FormFieldSizeType;
  placeholder?: string;
}

export function StringArrayField({
  name,
  label,
  placeholder,
  description,
  disabled,
  isRequired,
  size,
}: StringArrayFieldProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { control, setValue } = useFormContext();

  // Reads the field value as a plain string[]
  const items: string[] = useWatch({ control, name }) ?? [];

  function setItems(next: string[]) {
    setValue(name, next, { shouldValidate: true, shouldDirty: true });
  }

  function tryAdd(raw: string) {
    const val = raw.trim();
    if (!val) return;
    if (items.includes(val)) {
      toast.warning("Action already added.");
      return;
    }
    setItems([...items, val]);
    setInputValue("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      tryAdd(inputValue);
    }
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={() => (
          <FormItem className="space-y-0">
            {label && (
              <FormLabelExt
                size={size}
                {...{ label, disabled, isRequired, description }}
              />
            )}

            {/* Input row */}
            <div className="flex gap-2 mb-1 items-center">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                aria-label="New"
                fieldSize={size}
              />
              <Button
                type="button"
                size="icon7"
                onClick={() => tryAdd(inputValue)}
                disabled={disabled}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <FormMessage size={size} />
          </FormItem>
        )}
      />

      {/* Rows */}
      <div className="flex flex-col gap-1.5 mb-4">
        {items.length === 0 ? (
          <NoContentMessage
            primaryMessage="No action added"
            secondaryMessage="You have no action added."
            Icon={CircleOffIcon}
            className="mx-1"
          />
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 px-3 py-2",
                "bg-muted/50 border border-border rounded-md",
                "animate-in fade-in slide-in-from-top-1 duration-150",
              )}
            >
              <span className="text-xs text-muted-foreground w-4 tabular-nums shrink-0">
                {index + 1}
              </span>
              <span className="flex-1 text-sm text-wrap">{item}</span>
              <Button
                type="button"
                onClick={() => removeItem(index)}
                variant={"caution"}
                size={"icon5"}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
