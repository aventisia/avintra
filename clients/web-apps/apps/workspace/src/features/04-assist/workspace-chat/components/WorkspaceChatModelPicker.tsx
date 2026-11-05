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
  type WorkspaceChatModelState,
  type WorkspaceChatProviderGroup,
} from "../hooks/useWorkspaceChatModels.hook";

type WorkspaceChatModelPickerProps = {
  groups: WorkspaceChatProviderGroup[];
  selectedModel: WorkspaceChatModelState | null;
  onSelect: (modelKey: string | null) => void;
  isLoading: boolean;
  disabled?: boolean;
};

const CredentialBadge = ({ model }: { model: WorkspaceChatModelState }) => {
  if (!model.credentialName) return null;
  return (
    <span
      className="inline-flex max-w-[7rem] items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200"
      title={`Uses the tenant credential "${model.credentialName}"`}
    >
      <KeyIcon className="h-2.5 w-2.5 shrink-0" />
      <span className="truncate">{model.credentialName}</span>
    </span>
  );
};

/** Compact picker of the tenant's enabled and platform models, grouped by provider. */
export const WorkspaceChatModelPicker = ({
  groups,
  selectedModel,
  onSelect,
  isLoading,
  disabled,
}: WorkspaceChatModelPickerProps) => {
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
        disabled={disabled || isLoading}
        aria-label="Choose model"
        className="inline-flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-full border bg-background pl-2 pr-1.5 text-2xs font-medium shadow-sm transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <CircleNotchIcon className="h-3 w-3 animate-spin" />
        ) : (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent" />
        )}
        <span className="min-w-0 truncate">
          {selectedModel
            ? `${selectedModel.providerLabel} · ${selectedModel.modelId}`
            : isLoading
              ? "Loading models…"
              : "Default model"}
        </span>
        <CaretUpDownIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <MagnifyingGlassIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search models"
            aria-label="Search models"
            className="h-6 w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-muted",
              !selectedModel && "bg-muted/60",
            )}
          >
            <CheckIcon
              className={cn("h-3.5 w-3.5 shrink-0 text-primary", selectedModel && "invisible")}
            />
            <span className="min-w-0 flex-1 truncate font-medium">Default model</span>
          </button>
          {filteredGroups.length === 0 && (
            <p className="px-3 py-6 text-center text-2xs text-muted-foreground">
              No model matches.
            </p>
          )}
          {filteredGroups.map((group) => (
            <div key={group.provider} className="py-1">
              <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                      "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-muted",
                      isSelected && "bg-primary/5",
                    )}
                  >
                    <CheckIcon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-primary",
                        !isSelected && "invisible",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">{model.modelId}</span>
                    <CredentialBadge model={model} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <p className="border-t bg-muted/40 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
          Models with a provider key show that tenant credential. Other models run on platform
          credits.
        </p>
      </PopoverContent>
    </Popover>
  );
};
