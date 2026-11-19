/* eslint-disable react-refresh/only-export-components */
import { Input } from "@avplatform/ui";
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
import {
  ArrowRightIcon,
  CheckIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { KeyboardEvent, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

const VOICE_PRONUNCIATION_NAME = "__Pronunciation__Voice";
const DUPLICATE_MESSAGE = "This term is already in the list.";
const INVALID_MESSAGE =
  "Saved value is not a term and pronunciation list. It is kept until you add or remove a term.";

type PronunciationRow = { index: number; term: string; pronunciation: string };

type PronunciationHydration = {
  rows: PronunciationRow[];
  invalidText: string | null;
  source: unknown[] | null;
};

type VoicePronunciationFieldProps = BaseFieldProps & {
  name?: string;
  disabled?: boolean;
  size?: FormFieldSizeType;
  placeholder?: string;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const resolvePronunciationSource = (currentValue: unknown): unknown[] => {
  if (Array.isArray(currentValue)) return currentValue;

  if (typeof currentValue === "string") {
    try {
      const parsed: unknown = JSON.parse(currentValue);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }

  return [];
};

/** Reads a Voice Agent Pronunciation value into display rows, an invalid notice, and an emit source. */
export function toPronunciationRows(value: unknown): PronunciationHydration {
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

    return Array.isArray(parsed)
      ? toPronunciationRows(parsed)
      : { rows: [], invalidText: value, source: null };
  }

  if (!Array.isArray(value)) {
    return { rows: [], invalidText: null, source: null };
  }

  const rows: PronunciationRow[] = [];
  value.forEach((entry, index) => {
    const record = asRecord(entry);
    if (!record) return;

    const term = record.term;
    const pronunciation = record.pronunciation;
    if (typeof term !== "string" || term.trim() === "") return;
    if (typeof pronunciation !== "string" || pronunciation.trim() === "") return;

    rows.push({ index, term: term.trim(), pronunciation: pronunciation.trim() });
  });

  return { rows, invalidText: null, source: value };
}

// IMPORTANT NOTE: entries that are not valid term and pronunciation pairs stay in the emitted array at
// their original positions (the backend skips them at runtime and Zod rejects them), so only valid rows
// are shown and nothing is dropped or shifted.
/** Returns the Pronunciation array with a trimmed pair appended, preserving every other entry. */
export function buildPronunciationOnAdd(
  currentValue: unknown,
  term: string,
  pronunciation: string,
): Array<unknown> {
  return [...resolvePronunciationSource(currentValue), { term, pronunciation }];
}

/** Returns the Pronunciation array without the entry at the original index, preserving every other entry. */
export function buildPronunciationOnDelete(
  currentValue: unknown,
  originalIndex: number,
): Array<unknown> {
  const next = [...resolvePronunciationSource(currentValue)];
  next.splice(originalIndex, 1);
  return next;
}

/** Returns the Pronunciation array with the entry at the original index replaced, preserving every other entry. */
export function buildPronunciationOnUpdate(
  currentValue: unknown,
  originalIndex: number,
  term: string,
  pronunciation: string,
): Array<unknown> {
  const next = [...resolvePronunciationSource(currentValue)];
  if (originalIndex < 0 || originalIndex >= next.length) return next;

  next[originalIndex] = { term, pronunciation };
  return next;
}

const ROW_GRID = "grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_4.5rem] items-center gap-2 px-3";

const EXAMPLE_TERMS: Array<{ term: string; pronunciation: string }> = [
  { term: "SQL", pronunciation: "sequel" },
  { term: "nginx", pronunciation: "engine x" },
  { term: "kubectl", pronunciation: "cube control" },
];

/** Edits the Voice Agent Pronunciation list as a term and spoken-as lexicon with an add row beneath. */
export const VoicePronunciationField = ({
  name = VOICE_PRONUNCIATION_NAME,
  disabled,
  label,
  description,
  isRequired,
  size = "sm",
  placeholder,
}: VoicePronunciationFieldProps) => {
  const [termDraft, setTermDraft] = useState("");
  const [pronunciationDraft, setPronunciationDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTermDraft, setEditTermDraft] = useState("");
  const [editPronunciationDraft, setEditPronunciationDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const termInputRef = useRef<HTMLInputElement>(null);
  const pronunciationInputRef = useRef<HTMLInputElement>(null);

  const { control, setValue } = useFormContext();
  const value = useWatch({ control, name });
  const { rows, invalidText, source } = toPronunciationRows(value);

  const trimmedTerm = termDraft.trim();
  const trimmedPronunciation = pronunciationDraft.trim();
  const addDisabled = Boolean(disabled) || trimmedTerm === "" || trimmedPronunciation === "";
  const trimmedEditTerm = editTermDraft.trim();
  const trimmedEditPronunciation = editPronunciationDraft.trim();
  const saveEditDisabled =
    Boolean(disabled) || trimmedEditTerm === "" || trimmedEditPronunciation === "";

  function hasDuplicateTerm(term: string, excludeIndex?: number): boolean {
    const entries = source ?? [];
    return entries.some((entry, index) => {
      if (index === excludeIndex) return false;

      const record = asRecord(entry);
      if (!record) return false;

      const existing = record.term;
      return typeof existing === "string" && existing.trim().toLowerCase() === term;
    });
  }

  function warnDuplicate() {
    setNotice(DUPLICATE_MESSAGE);
    toast.warning(DUPLICATE_MESSAGE);
  }

  function tryAdd() {
    if (addDisabled) return;
    if (hasDuplicateTerm(trimmedTerm.toLowerCase())) return warnDuplicate();

    setValue(name, buildPronunciationOnAdd(value, trimmedTerm, trimmedPronunciation), {
      shouldValidate: true,
      shouldDirty: true,
    });
    setTermDraft("");
    setPronunciationDraft("");
    setNotice(null);
    termInputRef.current?.focus();
  }

  function applyExample(example: (typeof EXAMPLE_TERMS)[number]) {
    setTermDraft(example.term);
    setPronunciationDraft(example.pronunciation);
    setNotice(null);
    pronunciationInputRef.current?.focus();
  }

  function startEdit(row: PronunciationRow) {
    setEditingIndex(row.index);
    setEditTermDraft(row.term);
    setEditPronunciationDraft(row.pronunciation);
    setNotice(null);
  }

  function cancelEdit() {
    setEditingIndex(null);
    setEditTermDraft("");
    setEditPronunciationDraft("");
    setNotice(null);
  }

  function trySaveEdit() {
    if (editingIndex === null || saveEditDisabled) return;
    if (hasDuplicateTerm(trimmedEditTerm.toLowerCase(), editingIndex)) return warnDuplicate();

    setValue(
      name,
      buildPronunciationOnUpdate(value, editingIndex, trimmedEditTerm, trimmedEditPronunciation),
      { shouldValidate: true, shouldDirty: true },
    );
    cancelEdit();
  }

  function removeRow(originalIndex: number) {
    if (editingIndex !== null) cancelEdit();
    setValue(name, buildPronunciationOnDelete(value, originalIndex), {
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

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      trySaveEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  }

  const renderRow = (row: PronunciationRow) =>
    editingIndex === row.index ? (
      <li
        key={row.index}
        className={cn(
          ROW_GRID,
          "bg-[color-mix(in_srgb,var(--primary-base)_6%,transparent)] py-1.5",
        )}
      >
        <Input
          value={editTermDraft}
          onChange={(event) => {
            setEditTermDraft(event.target.value);
            setNotice(null);
          }}
          onKeyDown={handleEditKeyDown}
          disabled={disabled}
          aria-label="Edit term"
          fieldSize={size}
          autoFocus
        />
        <Input
          value={editPronunciationDraft}
          onChange={(event) => {
            setEditPronunciationDraft(event.target.value);
            setNotice(null);
          }}
          onKeyDown={handleEditKeyDown}
          disabled={disabled}
          aria-label="Edit pronunciation"
          fieldSize={size}
          className="font-mono"
        />
        <span className="flex justify-end gap-0.5">
          <Button
            type="button"
            size="icon6"
            onClick={trySaveEdit}
            disabled={saveEditDisabled}
            aria-label="Save pronunciation"
          >
            <CheckIcon aria-hidden="true" className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon6"
            onClick={cancelEdit}
            aria-label="Cancel edit"
            className="text-muted-foreground"
          >
            <XIcon aria-hidden="true" className="size-3.5" />
          </Button>
        </span>
      </li>
    ) : (
      <li
        key={row.index}
        className={cn(ROW_GRID, "group/row py-2 animate-in fade-in duration-150")}
      >
        <span title={row.term} className="truncate text-body-sm font-medium text-ink">
          {row.term}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <ArrowRightIcon aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
          <span title={row.pronunciation} className="truncate font-mono text-body-sm text-ink-2">
            {row.pronunciation}
          </span>
        </span>
        <span className="flex justify-end gap-0.5 opacity-70 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon6"
            onClick={() => startEdit(row)}
            disabled={disabled}
            aria-label={`Edit ${row.term}`}
            className="text-muted-foreground"
          >
            <PencilSimpleIcon aria-hidden="true" className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon6"
            onClick={() => removeRow(row.index)}
            disabled={disabled}
            aria-label={`Delete ${row.term}`}
            className="text-muted-foreground hover:bg-bad/10 hover:text-bad"
          >
            <TrashIcon aria-hidden="true" className="size-3.5" />
          </Button>
        </span>
      </li>
    );

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem className="space-y-2">
          {label && <FormLabelExt size={size} {...{ label, disabled, isRequired, description }} />}

          <div className="overflow-hidden rounded-md border border-line">
            {rows.length > 0 ? (
              <>
                <div
                  aria-hidden="true"
                  className={cn(
                    ROW_GRID,
                    "border-b border-line py-1.5 font-mono text-label uppercase text-muted-foreground",
                  )}
                >
                  <span>Term</span>
                  <span>Spoken as</span>
                </div>
                <ul aria-label="Pronunciations" className="divide-y divide-line">
                  {rows.map(renderRow)}
                </ul>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 px-3 py-2.5 text-hint text-muted-foreground">
                <span className="mr-0.5">No terms yet. Try</span>
                {EXAMPLE_TERMS.map((example) => (
                  <Button
                    key={example.term}
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={disabled}
                    onClick={() => applyExample(example)}
                    aria-label={`Use example ${example.term}`}
                    className="gap-1 font-mono"
                  >
                    {example.term}
                    <ArrowRightIcon aria-hidden="true" className="size-2.5 text-muted-foreground" />
                    {example.pronunciation}
                  </Button>
                ))}
              </div>
            )}

            <div className={cn(ROW_GRID, "border-t border-line bg-sunken/50 py-2")}>
              <Input
                ref={termInputRef}
                value={termDraft}
                onChange={(event) => {
                  setTermDraft(event.target.value);
                  setNotice(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder ?? "API"}
                disabled={disabled}
                aria-label="Term"
                fieldSize={size}
              />
              <Input
                ref={pronunciationInputRef}
                value={pronunciationDraft}
                onChange={(event) => {
                  setPronunciationDraft(event.target.value);
                  setNotice(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder ?? "A P I"}
                disabled={disabled}
                aria-label="Pronunciation"
                fieldSize={size}
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={tryAdd}
                disabled={addDisabled}
              >
                <PlusIcon aria-hidden="true" className="mr-1 size-3.5" />
                Add
              </Button>
            </div>
          </div>

          {notice && (
            <p role="alert" className="text-hint text-bad">
              {notice}
            </p>
          )}
          {invalidText !== null && <p className="text-hint text-bad">{INVALID_MESSAGE}</p>}
          <FormMessage size={size} />
        </FormItem>
      )}
    />
  );
};
