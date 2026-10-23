import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Paintbrush, X } from "lucide-react";

import {
  UI_BUILDER_STYLE_GROUPS,
  type UiBuilderStyleGroup,
  readUiBuilderStyleOption,
} from "../constants/ui-builder-style.constant";

type UiBuilderStylePanelProps = {
  tagName: string;
  classes: string[] | null;
  pendingChanges: number;
  isBusy: boolean;
  onChange: (group: UiBuilderStyleGroup, value: string | null) => void;
  onSave: () => void;
  onDiscard: () => void;
  onClose: () => void;
};

/** Floating panel that restyles the selected element by rewriting its classes, without the model. */
export const UiBuilderStylePanel = ({
  tagName,
  classes,
  pendingChanges,
  isBusy,
  onChange,
  onSave,
  onDiscard,
  onClose,
}: UiBuilderStylePanelProps) => (
  <aside
    aria-label="Style the selected element"
    className="absolute top-3 right-3 z-20 flex max-h-[calc(100%-1.5rem)] w-72 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
  >
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
      <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-800">
        <Paintbrush className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
        {tagName ? (
          <span className="truncate font-mono text-[11px]">&lt;{tagName}&gt;</span>
        ) : (
          "Style"
        )}
      </span>
      <button
        type="button"
        aria-label="Close style panel"
        onClick={onClose}
        className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
    {!tagName ? (
      <p className="p-3 text-2xs leading-relaxed text-slate-500">
        Select an element in the preview to style it.
      </p>
    ) : classes === null ? (
      <p className="p-3 text-2xs leading-relaxed text-slate-500">
        This element&apos;s classes are computed in code, so they cannot be edited here. Describe
        the change in the chat instead.
      </p>
    ) : (
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
        {UI_BUILDER_STYLE_GROUPS.map((group) => {
          const current = readUiBuilderStyleOption(classes, group);
          return (
            <div key={group.id} className="space-y-1">
              <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                {group.label}
              </span>
              <div role="radiogroup" aria-label={group.label} className="flex flex-wrap gap-1">
                {group.options.map((option) => {
                  const isActive =
                    option.value === null ? current === null : current === option.value;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      disabled={isBusy}
                      onClick={() => onChange(group, option.value)}
                      className={cn(
                        "rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition-colors disabled:opacity-50",
                        isActive
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    )}
    <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
      <span className="text-[10px] text-slate-400">
        {pendingChanges > 0
          ? `${pendingChanges} unsaved change${pendingChanges === 1 ? "" : "s"}`
          : "No model call · free"}
      </span>
      <div className="flex gap-1.5">
        <Button
          size="xs"
          variant="ghost"
          onClick={onDiscard}
          disabled={isBusy || pendingChanges === 0}
        >
          Discard
        </Button>
        <Button size="xs" onClick={onSave} disabled={isBusy || pendingChanges === 0}>
          Save version
        </Button>
      </div>
    </div>
  </aside>
);
