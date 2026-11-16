import { cn } from "@avplatform/ui/lib";
import { FingerprintIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { type UiBuilderQueueSchemaField } from "../dtos/ui-builder-dto";

const FIELD_TYPES: UiBuilderQueueSchemaField["type"][] = ["string", "int", "Date", "Array"];

type UiBuilderQueueSchemaEditorProps = {
  fields: UiBuilderQueueSchemaField[];
  onChange: (fields: UiBuilderQueueSchemaField[]) => void;
  readOnly?: boolean;
};

const inputClass =
  "h-7 w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 text-2xs text-slate-800 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 disabled:bg-slate-50";

/** Editable table of a queue's work item fields. */
export const UiBuilderQueueSchemaEditor = ({
  fields,
  onChange,
  readOnly = false,
}: UiBuilderQueueSchemaEditorProps) => {
  const patch = (index: number, change: Partial<UiBuilderQueueSchemaField>) =>
    onChange(fields.map((field, cursor) => (cursor === index ? { ...field, ...change } : field)));

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="grid grid-cols-[1.2fr_1.2fr_0.8fr_auto_auto_auto] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        <span>Field</span>
        <span>Label</span>
        <span>Type</span>
        <span title="Required">Req.</span>
        <span title="Unique reference">Key</span>
        <span className="w-6" />
      </div>
      <div className="divide-y divide-slate-100">
        {fields.length === 0 && (
          <p className="px-3 py-4 text-center text-2xs text-slate-400">No fields yet.</p>
        )}
        {fields.map((field, index) => (
          <div
            key={index}
            className="grid grid-cols-[1.2fr_1.2fr_0.8fr_auto_auto_auto] items-center gap-2 px-3 py-1.5"
          >
            <input
              aria-label="Field name"
              value={field.name}
              disabled={readOnly}
              onChange={(event) =>
                patch(index, { name: event.target.value.replace(/[^A-Za-z0-9_]/g, "") })
              }
              className={cn(inputClass, "font-mono")}
            />
            <input
              aria-label="Field label"
              value={field.label ?? ""}
              disabled={readOnly}
              onChange={(event) => patch(index, { label: event.target.value })}
              className={inputClass}
            />
            <select
              aria-label="Field type"
              value={field.type}
              disabled={readOnly}
              onChange={(event) =>
                patch(index, { type: event.target.value as UiBuilderQueueSchemaField["type"] })
              }
              className={inputClass}
            >
              {FIELD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="checkbox"
              aria-label="Required"
              checked={field.isRequired}
              disabled={readOnly}
              onChange={(event) => patch(index, { isRequired: event.target.checked })}
              className="h-3.5 w-3.5 accent-indigo-600"
            />
            <button
              type="button"
              aria-label="Use as unique reference"
              aria-pressed={field.isUsedForUniqueIdentifier}
              disabled={readOnly}
              onClick={() =>
                patch(index, {
                  isUsedForUniqueIdentifier: !field.isUsedForUniqueIdentifier,
                  isRequired: field.isRequired || !field.isUsedForUniqueIdentifier,
                })
              }
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                field.isUsedForUniqueIdentifier
                  ? "bg-amber-100 text-amber-700"
                  : "text-slate-300 hover:bg-slate-100 hover:text-slate-500",
              )}
            >
              <FingerprintIcon className="h-3.5 w-3.5" />
            </button>
            {readOnly ? (
              <span className="w-6" />
            ) : (
              <button
                type="button"
                aria-label="Remove field"
                onClick={() => onChange(fields.filter((_, cursor) => cursor !== index))}
                className="flex h-6 w-6 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={() =>
            onChange([
              ...fields,
              {
                name: `field${fields.length + 1}`,
                label: "",
                description: "",
                type: "string",
                isRequired: false,
                isUsedForUniqueIdentifier: false,
              },
            ])
          }
          className="flex w-full items-center justify-center gap-1 border-t border-slate-100 py-2 text-2xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50/50"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Add field
        </button>
      )}
    </div>
  );
};
