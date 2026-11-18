import { Input } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PlusIcon, TrashIcon, WarningIcon } from "@phosphor-icons/react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useController, useFormContext } from "react-hook-form";

import {
  buildVariablesOnAdd,
  buildVariablesOnDelete,
  toVariableRows,
} from "@/features/dynamic-config-panel";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import { toVariableName } from "../utils/voice-builder.util";

const ROW_GRID = "grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_4.5rem] items-center gap-2 px-3";

type VoiceVariablesEditorProps = {
  /** Placeholders the prompt uses, so a variable the prompt never mentions can say so. */
  usedNames: string[];
  /** Placeholders the prompt uses that no variable defines yet. */
  missingNames: string[];
};

const Placeholder = ({ name }: { name: string }) => (
  <>
    <span className="text-muted-foreground">{"{{"}</span>
    {name}
    <span className="text-muted-foreground">{"}}"}</span>
  </>
);

/** Name and value rows that fill the prompt's `{{name}}` placeholders, with an add row beneath. */
export const VoiceVariablesEditor = ({ usedNames, missingNames }: VoiceVariablesEditorProps) => {
  const { setValue, getValues } = useFormContext();
  const { field, fieldState } = useController({ name: VOICE_FIELDS.variables });
  const [nameDraft, setNameDraft] = useState("");
  const [valueDraft, setValueDraft] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  const { rows, invalidText, source } = toVariableRows(field.value);
  const hasVariables = rows.length > 0;
  const showEmptyHint = !hasVariables && missingNames.length === 0;
  const used = new Set(usedNames);
  const isDuplicate = nameDraft !== "" && source !== null && Object.hasOwn(source, nameDraft);
  const canAdd = nameDraft !== "" && valueDraft.trim() !== "" && !isDuplicate;

  // IMPORTANT NOTE: the runtime skips every variable while the stored enabled flag is false, and the
  // builder has no switch for it, so the flag follows whether any variable exists.
  useEffect(() => {
    if (hasVariables && getValues(VOICE_FIELDS.variablesEnabled) !== true)
      setValue(VOICE_FIELDS.variablesEnabled, true, { shouldDirty: true });
  }, [hasVariables, getValues, setValue]);

  const writeVariables = (next: Record<string, unknown>) =>
    setValue(VOICE_FIELDS.variables, next, { shouldDirty: true, shouldValidate: true });

  const addVariable = () => {
    if (!canAdd) return;
    writeVariables(buildVariablesOnAdd(field.value, nameDraft, valueDraft.trim()));
    setNameDraft("");
    setValueDraft("");
    nameInputRef.current?.focus();
  };

  const startDefining = (name: string) => {
    setNameDraft(name);
    valueInputRef.current?.focus();
  };

  const addOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addVariable();
  };

  return (
    <div className="space-y-2">
      {missingNames.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 text-body-sm text-ink">
          <WarningIcon aria-hidden="true" className="size-4 shrink-0 text-warn" />
          <span className="mr-0.5">Used in the prompt but not defined:</span>
          {missingNames.map((name) => (
            <Button
              key={name}
              type="button"
              variant="outline"
              size="xs"
              className="font-mono"
              aria-label={`Define ${name}`}
              onClick={() => startDefining(name)}
            >
              <PlusIcon aria-hidden="true" className="size-3" />
              {name}
            </Button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-line">
        {hasVariables ? (
          <>
            <div
              aria-hidden="true"
              className={cn(
                ROW_GRID,
                "border-b border-line py-1.5 font-mono text-label uppercase text-muted-foreground",
              )}
            >
              <span>Name</span>
              <span>Value</span>
            </div>
            <ul aria-label="Variables" className="divide-y divide-line">
              {rows.map((row) => (
                <li
                  key={row.key}
                  className={cn(ROW_GRID, "py-1.5 animate-in fade-in duration-150")}
                >
                  <span className="min-w-0">
                    <span
                      title={row.key}
                      className="block truncate font-mono text-body-sm text-ink"
                    >
                      <Placeholder name={row.key} />
                    </span>
                    {!used.has(row.key) && (
                      <span className="block text-hint text-muted-foreground">
                        Not in the prompt
                      </span>
                    )}
                  </span>
                  <Input
                    fieldSize="sm"
                    value={row.displayValue}
                    onChange={(event) =>
                      writeVariables(buildVariablesOnAdd(field.value, row.key, event.target.value))
                    }
                    aria-label={`Value of ${row.key}`}
                    aria-invalid={row.displayValue.trim() === ""}
                    placeholder="Value"
                    className="border-transparent bg-transparent"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon6"
                    aria-label={`Remove ${row.key}`}
                    onClick={() => writeVariables(buildVariablesOnDelete(field.value, row.key))}
                    className="justify-self-end text-muted-foreground hover:bg-bad/10 hover:text-bad"
                  >
                    <TrashIcon aria-hidden="true" className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          showEmptyHint && (
            <p className="px-3 py-2.5 text-hint text-muted-foreground">
              No variables yet. Type <span className="font-mono">{"{{name}}"}</span> in the persona,
              instructions, or introduction, then give it a value here.
            </p>
          )
        )}

        <div
          className={cn(
            ROW_GRID,
            "bg-sunken/50 py-2",
            (hasVariables || showEmptyHint) && "border-t border-line",
          )}
        >
          <Input
            ref={nameInputRef}
            fieldSize="sm"
            value={nameDraft}
            onChange={(event) => setNameDraft(toVariableName(event.target.value))}
            onKeyDown={addOnEnter}
            placeholder="company_name"
            aria-label="New variable name"
            aria-invalid={isDuplicate}
            className="font-mono"
          />
          <Input
            ref={valueInputRef}
            fieldSize="sm"
            value={valueDraft}
            onChange={(event) => setValueDraft(event.target.value)}
            onKeyDown={addOnEnter}
            placeholder="Acme"
            aria-label="New variable value"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canAdd}
            onClick={addVariable}
          >
            <PlusIcon aria-hidden="true" className="mr-1 size-3.5" />
            Add
          </Button>
        </div>
      </div>

      {isDuplicate && (
        <p role="alert" className="text-hint text-bad">
          <Placeholder name={nameDraft} /> already exists. Change its value in the list above.
        </p>
      )}
      {invalidText !== null && (
        <p className="text-hint text-bad">
          The saved variables are not a name and value list. They are kept until you add or remove
          one.
        </p>
      )}
      {fieldState.error?.message && (
        <p className="text-hint text-bad">{fieldState.error.message}</p>
      )}
    </div>
  );
};
