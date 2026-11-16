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
import { CheckIcon, PencilIcon, PlusIcon, ProhibitIcon, XIcon } from "@phosphor-icons/react";
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

/** Edits the Voice Agent Pronunciation list with add, edit, list, and delete rows. */
export const VoicePronunciationField = ({
  name = VOICE_PRONUNCIATION_NAME,
  disabled,
  label,
  description,
  isRequired,
  size,
  placeholder,
}: VoicePronunciationFieldProps) => {
  const [termDraft, setTermDraft] = useState("");
  const [pronunciationDraft, setPronunciationDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTermDraft, setEditTermDraft] = useState("");
  const [editPronunciationDraft, setEditPronunciationDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const termInputRef = useRef<HTMLInputElement>(null);

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

  function updateTermDraft(next: string) {
    setTermDraft(next);
    setNotice(null);
  }

  function updatePronunciationDraft(next: string) {
    setPronunciationDraft(next);
    setNotice(null);
  }

  function updateEditTermDraft(next: string) {
    setEditTermDraft(next);
    setNotice(null);
  }

  function updateEditPronunciationDraft(next: string) {
    setEditPronunciationDraft(next);
    setNotice(null);
  }

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

  function tryAdd() {
    if (addDisabled) return;

    if (hasDuplicateTerm(trimmedTerm.toLowerCase())) {
      setNotice(DUPLICATE_MESSAGE);
      toast.warning(DUPLICATE_MESSAGE);
      return;
    }

    setValue(name, buildPronunciationOnAdd(value, trimmedTerm, trimmedPronunciation), {
      shouldValidate: true,
      shouldDirty: true,
    });
    setTermDraft("");
    setPronunciationDraft("");
    setNotice(null);
    termInputRef.current?.focus();
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

    if (hasDuplicateTerm(trimmedEditTerm.toLowerCase(), editingIndex)) {
      setNotice(DUPLICATE_MESSAGE);
      toast.warning(DUPLICATE_MESSAGE);
      return;
    }

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
                ref={termInputRef}
                value={termDraft}
                onChange={(event) => updateTermDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder ?? "API"}
                disabled={disabled}
                aria-label="Term"
                fieldSize={size}
              />
              <Input
                value={pronunciationDraft}
                onChange={(event) => updatePronunciationDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder ?? "A P I"}
                disabled={disabled}
                aria-label="Pronunciation"
                fieldSize={size}
              />
              <Button type="button" size="icon7" onClick={tryAdd} disabled={addDisabled}>
                <PlusIcon className="h-3.5 w-3.5" />
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
            primaryMessage="No terms added"
            secondaryMessage="Add a term and how it should be spoken."
            Icon={ProhibitIcon}
            className="mx-1"
          />
        ) : (
          rows.map((row, displayIndex) => (
            <div
              key={row.index}
              className={cn(
                "flex items-center gap-2 px-3 py-2",
                "bg-muted/50 border border-border rounded-md",
                "animate-in fade-in slide-in-from-top-1 duration-150",
              )}
            >
              <span className="text-xs text-muted-foreground w-4 tabular-nums shrink-0">
                {displayIndex + 1}
              </span>
              {editingIndex === row.index ? (
                <>
                  <Input
                    value={editTermDraft}
                    onChange={(event) => updateEditTermDraft(event.target.value)}
                    onKeyDown={handleEditKeyDown}
                    disabled={disabled}
                    aria-label="Edit term"
                    fieldSize={size}
                  />
                  <Input
                    value={editPronunciationDraft}
                    onChange={(event) => updateEditPronunciationDraft(event.target.value)}
                    onKeyDown={handleEditKeyDown}
                    disabled={disabled}
                    aria-label="Edit pronunciation"
                    fieldSize={size}
                  />
                  <Button
                    type="button"
                    onClick={trySaveEdit}
                    size={"icon5"}
                    disabled={saveEditDisabled}
                    aria-label="Save pronunciation"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    onClick={cancelEdit}
                    variant={"ghost"}
                    size={"icon5"}
                    aria-label="Cancel edit"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-wrap">
                    <span className="font-medium">{row.term}</span>
                    <span className="text-muted-foreground"> = {row.pronunciation}</span>
                  </span>
                  <Button
                    type="button"
                    onClick={() => startEdit(row)}
                    variant={"ghost"}
                    size={"icon5"}
                    disabled={disabled}
                    aria-label={`Edit ${row.term}`}
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => removeRow(row.index)}
                    variant={"caution"}
                    size={"icon5"}
                    disabled={disabled}
                    aria-label={`Delete ${row.term}`}
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
};
