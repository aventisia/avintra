import { Button, buttonVariants } from "@avplatform/ui/buttons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@avplatform/ui/command";
import { FormControl, FormField, FormItem, FormLabelExt, FormMessage } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { CaretUpDownIcon, CheckIcon, PlayIcon, StopIcon } from "@phosphor-icons/react";
import { type KeyboardEvent, type MouseEvent, useState } from "react";
import { useFormContext } from "react-hook-form";

import { type VoiceOption, useVoicePreview } from "@/features/dynamic-config-panel";

export type VoicePreviewRequest = Omit<Parameters<typeof useVoicePreview>[0], "voice" | "sample">;

const SEARCH_THRESHOLD = 8;

const splitVoiceLabel = (label: string) => {
  const match = /^(.*?)\s*\((.*)\)$/.exec(label);
  return match ? { name: match[1], traits: match[2] } : { name: label, traits: "" };
};

const VoiceAvatar = ({ name, className }: { name: string; className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      "grid shrink-0 place-items-center rounded-full bg-fill font-semibold text-ink-2",
      className,
    )}
  >
    {name.trim().charAt(0).toUpperCase()}
  </span>
);

const VoicePreviewButton = ({
  voice,
  preview,
  className,
  showReason = false,
}: {
  voice: VoiceOption;
  preview: VoicePreviewRequest;
  className?: string;
  showReason?: boolean;
}) => {
  const { name } = splitVoiceLabel(voice.label);
  const player = useVoicePreview({ ...preview, voice: voice.value, sample: voice.sample });

  const disabledReason =
    player.isPreviewing || player.canPreview
      ? undefined
      : player.isSupported
        ? "Pick a model to hear this voice"
        : "Preview is not supported for this provider";

  const toggle = (event: MouseEvent) => {
    event.stopPropagation();
    if (player.isPreviewing) player.stopPreview();
    else void player.playPreview();
  };

  const keepKeysLocal = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") event.stopPropagation();
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        aria-label={
          player.isPreviewing
            ? `Stop ${name}`
            : disabledReason
              ? `Preview ${name} — ${disabledReason}`
              : `Preview ${name}`
        }
        title={player.error ?? disabledReason}
        disabled={!player.canPreview && !player.isPreviewing}
        onClick={toggle}
        onKeyDown={keepKeysLocal}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "text-ink-2",
          player.isPreviewing &&
            "border-primary/40 bg-selected text-primary-text hover:border-primary/40 hover:bg-selected",
          player.error && "border-bad/50 text-bad hover:border-bad/50",
          className,
        )}
      >
        {player.isPreviewing ? (
          <StopIcon aria-hidden="true" weight="fill" className="size-3" />
        ) : (
          <PlayIcon aria-hidden="true" weight="fill" className="size-3" />
        )}
      </button>
      {player.error ? (
        <span role="alert" className={showReason ? "text-2xs text-bad" : "sr-only"}>
          {player.error}
        </span>
      ) : showReason && disabledReason ? (
        <span className="text-2xs text-muted-foreground">{disabledReason}</span>
      ) : null}
    </span>
  );
};

type VoicePickerFieldProps = {
  name: string;
  voices: VoiceOption[];
  /** Adds play buttons when the provider can preview its voices. */
  preview?: VoicePreviewRequest;
  label?: string;
};

/** Compact voice picker: the chosen voice in one row, every voice in a searchable popover. */
export const VoicePickerField = ({
  name,
  voices,
  preview,
  label = "Voice",
}: VoicePickerFieldProps) => {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => {
        const selected = voices.find((voice) => voice.value === field.value);
        const selectedParts = selected ? splitVoiceLabel(selected.label) : undefined;

        return (
          <FormItem size="sm">
            <FormLabelExt size="sm" label={label} />
            <div className="flex flex-wrap items-center gap-1.5">
              <Popover open={open} onOpenChange={setOpen}>
                <FormControl>
                  <PopoverTrigger asChild>
                    <Button
                      variant="field"
                      role="combobox"
                      aria-label={label}
                      aria-expanded={open}
                      className="h-8 min-w-0 flex-1 justify-between gap-2 px-2.5 text-xs"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {selectedParts ? (
                          <VoiceAvatar name={selectedParts.name} className="size-5 text-3xs" />
                        ) : null}
                        <span className="truncate">{selectedParts?.name ?? "Pick a voice"}</span>
                        {selectedParts?.traits && (
                          <span className="truncate font-normal text-muted-foreground">
                            {selectedParts.traits}
                          </span>
                        )}
                      </span>
                      <CaretUpDownIcon
                        aria-hidden="true"
                        className="size-3.5 shrink-0 opacity-50"
                      />
                    </Button>
                  </PopoverTrigger>
                </FormControl>
                <PopoverContent
                  align="start"
                  className="w-[max(var(--radix-popover-trigger-width),19rem)] p-1.5"
                >
                  <Command>
                    {voices.length > SEARCH_THRESHOLD && (
                      <div className="mb-1 rounded-lg bg-sunken">
                        <CommandInput
                          className="h-8 text-xs"
                          placeholder="Search voices…"
                          autoFocus
                        />
                      </div>
                    )}
                    <CommandList className="max-h-72">
                      <CommandEmpty>No voices match.</CommandEmpty>
                      <CommandGroup>
                        {voices.map((voice) => {
                          const { name: voiceName, traits } = splitVoiceLabel(voice.label);
                          const isSelected = voice.value === field.value;
                          return (
                            <CommandItem
                              key={voice.value}
                              value={`${voice.label} ${voice.value}`}
                              onSelect={() => {
                                field.onChange(voice.value);
                                setOpen(false);
                              }}
                              className={cn("gap-2.5 rounded-md", isSelected && "bg-selected")}
                            >
                              <VoiceAvatar name={voiceName} className="size-6 text-2xs" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium">{voiceName}</span>
                                {traits && (
                                  <span className="block truncate text-2xs text-muted-foreground">
                                    {traits}
                                  </span>
                                )}
                              </span>
                              {isSelected && (
                                <CheckIcon
                                  aria-hidden="true"
                                  className="size-3.5 shrink-0 text-primary-text"
                                />
                              )}
                              {preview && (
                                <VoicePreviewButton
                                  voice={voice}
                                  preview={preview}
                                  className="size-6 border-transparent bg-transparent hover:border-transparent"
                                />
                              )}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {preview && selected && (
                <VoicePreviewButton voice={selected} preview={preview} showReason />
              )}
            </div>
            <FormMessage size="sm" />
          </FormItem>
        );
      }}
    />
  );
};
