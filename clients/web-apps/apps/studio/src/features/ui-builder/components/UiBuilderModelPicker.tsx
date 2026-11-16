import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import {
  CaretUpDownIcon,
  CheckIcon,
  CircleNotchIcon,
  KeyIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import {
  type UiBuilderModelState,
  type UiBuilderProviderGroup,
} from "../hooks/useUiBuilderModels.hook";

type UiBuilderModelPickerProps = {
  groups: UiBuilderProviderGroup[];
  selectedModel: UiBuilderModelState | null;
  onSelect: (modelKey: string) => void;
  isLoading: boolean;
  disabled?: boolean;
};

const CredentialBadge = ({ model }: { model: UiBuilderModelState }) => (
  <span
    className="inline-flex max-w-[7rem] items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200"
    title={`Uses the tenant credential "${model.credentialName}"`}
  >
    <KeyIcon className="h-2.5 w-2.5 shrink-0" />
    <span className="truncate">{model.credentialName}</span>
  </span>
);

/** Compact picker of the tenant's credential-backed models, grouped by provider. */
export const UiBuilderModelPicker = ({
  groups,
  selectedModel,
  onSelect,
  isLoading,
  disabled,
}: UiBuilderModelPickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return groups;
    return groups
      .map((group) => ({
        ...group,
        models: group.models.filter(
          (model) =>
            model.modelId.toLowerCase().includes(needle) ||
            group.label.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.models.length > 0);
  }, [groups, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled || isLoading || groups.length === 0}
        aria-label="Choose model"
        className="group inline-flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white pl-2 pr-1.5 text-2xs font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <CircleNotchIcon className="h-3 w-3 animate-spin" />
        ) : (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
        )}
        <span className="min-w-0 truncate">
          {selectedModel
            ? `${selectedModel.providerLabel} · ${selectedModel.modelId}`
            : isLoading
              ? "Loading models…"
              : "No model"}
        </span>
        <CaretUpDownIcon className="h-3 w-3 shrink-0 text-slate-400" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
          <MagnifyingGlassIcon className="h-3.5 w-3.5 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search enabled models"
            aria-label="Search enabled models"
            className="h-6 w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {filteredGroups.length === 0 && (
            <p className="px-3 py-6 text-center text-2xs text-muted-foreground">
              No enabled model matches.
            </p>
          )}
          {filteredGroups.map((group) => (
            <div key={group.providerType} className="py-1">
              <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {group.label}
              </p>
              {group.models.map((model) => {
                const isSelected = model.key === selectedModel?.key;
                return (
                  <button
                    key={model.key}
                    type="button"
                    onClick={() => {
                      onSelect(model.key);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-slate-50",
                      isSelected && "bg-indigo-50/60",
                    )}
                  >
                    <CheckIcon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-indigo-600",
                        !isSelected && "invisible",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium text-slate-800">
                      {model.modelId}
                    </span>
                    <CredentialBadge model={model} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <p className="border-t border-slate-100 bg-slate-50/80 px-3 py-2 text-[10px] leading-relaxed text-slate-500">
          Only models enabled in Tenant Admin › Models with a provider credential are listed.
          Generation uses that credential and is billed by the provider.
        </p>
      </PopoverContent>
    </Popover>
  );
};
