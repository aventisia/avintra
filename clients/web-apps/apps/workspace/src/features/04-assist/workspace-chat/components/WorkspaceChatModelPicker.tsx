import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import {
  CaretUpDownIcon,
  CheckIcon,
  CircleNotchIcon,
  GearIcon,
  KeyIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const isEmpty = groups.length === 0 && !isLoading;

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
              : "Select model"}
        </span>
        <CaretUpDownIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex max-h-[var(--radix-popover-content-available-height,100dvh)] w-80 flex-col overflow-hidden p-0"
      >
        <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2">
          <MagnifyingGlassIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search models"
            aria-label="Search models"
            className="h-6 w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-80 min-h-0 overflow-y-auto py-1">
          {isEmpty ? (
            <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
              <p className="text-2xs text-muted-foreground">No models configured.</p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/tenant/model-providers");
                }}
                className="inline-flex h-7 items-center gap-1.5 rounded-full border bg-background px-3 text-2xs font-medium shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
              >
                <GearIcon className="h-3 w-3" />
                Configure models
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
        <p className="shrink-0 border-t bg-muted/40 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
          Key badge marks models using a tenant vault credential.
        </p>
      </PopoverContent>
    </Popover>
  );
};
