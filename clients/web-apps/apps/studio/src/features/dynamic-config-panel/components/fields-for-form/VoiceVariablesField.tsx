/* eslint-disable react-refresh/only-export-components */
import { EmptyState, Input } from "@avplatform/ui";
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
import { useFormContext, useWatch } from "react-hook-form";

const VOICE_VARIABLES_NAME = "__Variables__Voice";
const DUPLICATE_MESSAGE = "A variable with this name already exists.";
const INVALID_MESSAGE =
  "Saved value is not a name and value list. It is kept until you add or remove a variable.";

type VariableRow = { key: string; displayValue: string };

type VariablesHydration = {
  rows: VariableRow[];
  invalidText: string | null;
  source: Record<string, unknown> | null;
};

type VoiceVariablesFieldProps = BaseFieldProps & {
  name?: string;
  disabled?: boolean;
  size?: FormFieldSizeType;
  placeholder?: string;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isDisplayableValue = (value: unknown): boolean =>
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean" ||
  typeof value === "bigint";

const resolveVariableSource = (currentValue: unknown): Record<string, unknown> => {
  if (isPlainObject(currentValue)) return currentValue;

  if (typeof currentValue === "string") {
    try {
      const parsed: unknown = JSON.parse(currentValue);
      if (isPlainObject(parsed)) return parsed;
    } catch {
      return {};
    }
  }

  return {};
};

/** Reads a Voice Agent Variables value into display rows, an invalid notice, and an emit source. */
export function toVariableRows(value: unknown): VariablesHydration {
  if (value === null || value === undefined) {
    return { rows: [], invalidText: null, source: null };
  }

  if (typeof value === "string") {
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      return { rows: [], invalidText: value, source: null };
    }

    return isPlainObject(parsed)
      ? toVariableRows(parsed)
      : { rows: [], invalidText: value, source: null };
  }

  if (!isPlainObject(value)) {
    return { rows: [], invalidText: null, source: null };
  }

  const rows = Object.entries(value)
    .filter(([, entryValue]) => isDisplayableValue(entryValue))
    .map(([key, entryValue]) => ({ key, displayValue: String(entryValue) }));

  return { rows, invalidText: null, source: value };
}

// IMPORTANT NOTE: entries that are not plain string values stay in the emitted object byte-identical
// (the backend keeps them and Zod rejects them), so only valid rows are shown and nothing is dropped.
/** Returns the Variables object with a trimmed pair added, preserving every other entry. */
export function buildVariablesOnAdd(
  currentValue: unknown,
  key: string,
  valueText: string,
): Record<string, unknown> {
  return { ...resolveVariableSource(currentValue), [key]: valueText };
}

/** Returns the Variables object without the given key, preserving every other entry. */
export function buildVariablesOnDelete(
  currentValue: unknown,
  key: string,
): Record<string, unknown> {
  const next = { ...resolveVariableSource(currentValue) };
  delete next[key];
  return next;
}

/** Edits the Voice Agent Variables map with add, list, and delete rows. */
export const VoiceVariablesField = ({
  name = VOICE_VARIABLES_NAME,
  disabled,
  label,
  description,
  isRequired,
  size,
  placeholder,
}: VoiceVariablesFieldProps) => {
  const [keyDraft, setKeyDraft] = useState("");
  const [valueDraft, setValueDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  const { control, setValue } = useFormContext();
  const value = useWatch({ control, name });
  const { rows, invalidText, source } = toVariableRows(value);

  const trimmedKey = keyDraft.trim();
  const trimmedValue = valueDraft.trim();
  const addDisabled = Boolean(disabled) || trimmedKey === "" || trimmedValue === "";

  function updateKeyDraft(next: string) {
    setKeyDraft(next);
    setNotice(null);
  }

  function updateValueDraft(next: string) {
    setValueDraft(next);
    setNotice(null);
  }

  function tryAdd() {
    if (addDisabled) return;

    if (source && Object.keys(source).includes(trimmedKey)) {
      setNotice(DUPLICATE_MESSAGE);
      toast.warning(DUPLICATE_MESSAGE);
      return;
    }

    setValue(name, buildVariablesOnAdd(value, trimmedKey, trimmedValue), {
      shouldValidate: true,
      shouldDirty: true,
    });
    setKeyDraft("");
    setValueDraft("");
    setNotice(null);
    keyInputRef.current?.focus();
  }

  function removeRow(key: string) {
    setValue(name, buildVariablesOnDelete(value, key), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      tryAdd();
    }
  }

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={() => (
          <FormItem className="space-y-0">
            {label && (
              <FormLabelExt size={size} {...{ label, disabled, isRequired, description }} />
            )}

            <div className="flex gap-2 mb-1 items-center">
              <Input
                ref={keyInputRef}
                value={keyDraft}
                onChange={(event) => updateKeyDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder ?? "company_name"}
                disabled={disabled}
                aria-label="Variable name"
                fieldSize={size}
              />
              <Input
                value={valueDraft}
                onChange={(event) => updateValueDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder ?? "Acme"}
                disabled={disabled}
                aria-label="Variable value"
                fieldSize={size}
              />
              <Button type="button" size="icon7" onClick={tryAdd} disabled={addDisabled}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {notice ? <p className="text-xs text-destructive mb-1">{notice}</p> : null}
            {invalidText !== null ? (
              <p className="text-xs text-destructive mb-1">{INVALID_MESSAGE}</p>
            ) : null}

            <FormMessage size={size} />
          </FormItem>
        )}
      />

      <div className="flex flex-col gap-1.5 mb-4">
        {rows.length === 0 ? (
          <EmptyState
            primaryMessage="No variables added"
            secondaryMessage="Add a name and value pair to fill placeholders."
            Icon={CircleOffIcon}
            className="mx-1"
          />
        ) : (
          rows.map((row, index) => (
            <div
              key={row.key}
              className={cn(
                "flex items-center gap-2 px-3 py-2",
                "bg-muted/50 border border-border rounded-md",
                "animate-in fade-in slide-in-from-top-1 duration-150",
              )}
            >
              <span className="text-xs text-muted-foreground w-4 tabular-nums shrink-0">
                {index + 1}
              </span>
              <span className="flex-1 text-sm text-wrap">
                <span className="font-medium">{row.key}</span>
                <span className="text-muted-foreground"> = {row.displayValue}</span>
              </span>
              <Button
                type="button"
                onClick={() => removeRow(row.key)}
                variant={"caution"}
                size={"icon5"}
                disabled={disabled}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </>
  );
};
