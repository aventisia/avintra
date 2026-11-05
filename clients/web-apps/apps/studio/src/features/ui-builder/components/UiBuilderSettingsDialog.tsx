import { Switch } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { ImageIcon, TrashIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import {
  UI_BUILDER_DEFAULT_THEME,
  UI_BUILDER_THEME_PRESETS,
} from "../constants/ui-builder-theme.constant";
import { type UiBuilderProjectDto, type UiBuilderThemeDto } from "../dtos/ui-builder-dto";
import { type UiBuilderAssetsState, toUiBuilderAssetName } from "../hooks/useUiBuilderAssets.hook";
import { useUiBuilderProjectSettings } from "../hooks/useUiBuilderProjectSettings.hook";

const INSTRUCTIONS_CAP = 4000;
const MAX_ASSET_BYTES = 512 * 1024;
const ASSET_TYPES = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const NEUTRAL_OPTIONS: UiBuilderThemeDto["neutralColor"][] = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
];
const RADIUS_OPTIONS: UiBuilderThemeDto["radius"][] = ["none", "sm", "md", "lg", "xl"];
const FONT_OPTIONS: { value: UiBuilderThemeDto["fontFamily"]; label: string }[] = [
  { value: "inter", label: "Inter" },
  { value: "system", label: "System" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
];

const ChoiceRow = <TValue extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: { value: TValue; label: string }[];
  value: TValue;
  onChange: (value: TValue) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-2xs font-medium text-slate-600">{label}</span>
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg bg-slate-100 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-2 py-1 text-2xs font-medium capitalize transition-colors",
            value === option.value
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

type UiBuilderSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  project: UiBuilderProjectDto;
  onThemeSaved?: (theme: UiBuilderThemeDto) => void;
  assets: UiBuilderAssetsState;
};

/** Owner dialog for the project's standing instructions and template sharing. */
export const UiBuilderSettingsDialog = ({
  open,
  onOpenChange,
  projectId,
  project,
  onThemeSaved,
  assets,
}: UiBuilderSettingsDialogProps) => {
  const assetInputRef = useRef<HTMLInputElement>(null);

  const uploadAssets = (files: FileList | null) => {
    const taken = new Set(assets.assets.map((asset) => asset.name.toLowerCase()));
    for (const file of Array.from(files ?? [])) {
      if (file.size > MAX_ASSET_BYTES) {
        toast.error(`${file.name} is larger than 512 KB.`);
        continue;
      }
      let name = toUiBuilderAssetName(file.name);
      for (let suffix = 2; taken.has(name.toLowerCase()); suffix += 1) {
        name = `${toUiBuilderAssetName(file.name).slice(0, 60)}${suffix}`;
      }
      taken.add(name.toLowerCase());
      assets.uploadMutation.mutate({ file, name });
    }
  };
  const saveMutation = useUiBuilderProjectSettings(projectId);
  const [instructions, setInstructions] = useState(project.instructions ?? "");
  const [isTemplate, setIsTemplate] = useState(Boolean(project.isTemplate));
  const [theme, setTheme] = useState<UiBuilderThemeDto>(project.theme ?? UI_BUILDER_DEFAULT_THEME);
  const [colorDraft, setColorDraft] = useState(theme.primaryColor);

  useEffect(() => {
    if (!open) return;
    const nextTheme = project.theme ?? UI_BUILDER_DEFAULT_THEME;
    setInstructions(project.instructions ?? "");
    setIsTemplate(Boolean(project.isTemplate));
    setTheme(nextTheme);
    setColorDraft(nextTheme.primaryColor);
  }, [open, project.instructions, project.isTemplate, project.theme]);

  const patchTheme = (patch: Partial<UiBuilderThemeDto>) =>
    setTheme((current) => ({ ...current, ...patch }));

  const isColorValid = HEX_COLOR_PATTERN.test(colorDraft);
  const themeChanged =
    JSON.stringify(theme) !== JSON.stringify(project.theme ?? UI_BUILDER_DEFAULT_THEME);

  const savedTheme = { ...theme, primaryColor: theme.primaryColor.toLowerCase() };

  const handleSave = () =>
    saveMutation.mutate(
      { instructions: instructions.trim() || null, theme: savedTheme, isTemplate },
      {
        onSuccess: () => {
          onOpenChange(false);
          if (themeChanged) onThemeSaved?.(savedTheme);
        },
      },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg space-y-4 overflow-y-auto p-4">
        <DialogDefaultHeader
          heading="Project settings"
          description="Applied to every generation in this project."
        />

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-800">Project instructions</span>
          <span className="block text-2xs text-slate-500">
            Standing guidance the builder always follows, such as audience, tone, terminology, or
            layout rules.
          </span>
          <textarea
            value={instructions}
            maxLength={INSTRUCTIONS_CAP}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="Users are claims processors on desktop. Keep layouts dense, use our terms 'claim' and 'adjuster', and show amounts in USD."
            className="h-36 w-full resize-none rounded-md border border-slate-200 bg-white p-2 text-xs"
            disabled={saveMutation.isPending}
          />
          <span className="block text-right text-[10px] text-slate-400">
            {instructions.length}/{INSTRUCTIONS_CAP}
          </span>
        </label>

        <section className="space-y-3 rounded-lg border border-slate-200 p-3" aria-label="Theme">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-800">Theme</span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                background: theme.mode === "dark" ? "#0f172a" : "#ffffff",
                color: theme.mode === "dark" ? "#f8fafc" : "#0f172a",
                border: "1px solid #e2e8f0",
              }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: theme.primaryColor }}
              />
              Preview
            </span>
          </div>
          <div className="space-y-1.5">
            <span className="text-2xs font-medium text-slate-600">Brand color</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {UI_BUILDER_THEME_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  aria-label={preset.label}
                  aria-pressed={theme.primaryColor.toLowerCase() === preset.value}
                  disabled={saveMutation.isPending}
                  onClick={() => {
                    patchTheme({ primaryColor: preset.value });
                    setColorDraft(preset.value);
                  }}
                  className={cn(
                    "h-6 w-6 rounded-full ring-offset-2 transition-shadow",
                    theme.primaryColor.toLowerCase() === preset.value && "ring-2 ring-slate-900",
                  )}
                  style={{ background: preset.value }}
                />
              ))}
              <label className="ml-1 inline-flex items-center gap-1 text-2xs text-slate-500">
                <span className="sr-only">Custom brand color</span>
                <input
                  type="color"
                  value={isColorValid ? colorDraft : theme.primaryColor}
                  onChange={(event) => {
                    setColorDraft(event.target.value);
                    patchTheme({ primaryColor: event.target.value });
                  }}
                  className="h-6 w-6 cursor-pointer rounded border border-slate-200 bg-white p-0"
                  disabled={saveMutation.isPending}
                />
                <input
                  aria-label="Brand color hex value"
                  value={colorDraft}
                  maxLength={7}
                  onChange={(event) => {
                    setColorDraft(event.target.value);
                    if (HEX_COLOR_PATTERN.test(event.target.value))
                      patchTheme({ primaryColor: event.target.value });
                  }}
                  className={cn(
                    "h-6 w-20 rounded border px-1.5 font-mono text-[10px]",
                    isColorValid ? "border-slate-200" : "border-rose-300 text-rose-600",
                  )}
                  disabled={saveMutation.isPending}
                />
              </label>
            </div>
          </div>
          <ChoiceRow
            label="Mode"
            value={theme.mode}
            onChange={(mode) => patchTheme({ mode })}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            disabled={saveMutation.isPending}
          />
          <ChoiceRow
            label="Neutrals"
            value={theme.neutralColor}
            onChange={(neutralColor) => patchTheme({ neutralColor })}
            options={NEUTRAL_OPTIONS.map((value) => ({ value, label: value }))}
            disabled={saveMutation.isPending}
          />
          <ChoiceRow
            label="Corners"
            value={theme.radius}
            onChange={(radius) => patchTheme({ radius })}
            options={RADIUS_OPTIONS.map((value) => ({ value, label: value }))}
            disabled={saveMutation.isPending}
          />
          <ChoiceRow
            label="Font"
            value={theme.fontFamily}
            onChange={(fontFamily) => patchTheme({ fontFamily })}
            options={FONT_OPTIONS}
            disabled={saveMutation.isPending}
          />
          <p className="text-[10px] text-slate-400">
            React versions only. Saving a new theme rebuilds the current version with it, without
            calling the model.
          </p>
        </section>

        <section className="space-y-2 rounded-lg border border-slate-200 p-3" aria-label="Images">
          <div className="flex items-center justify-between gap-2">
            <span>
              <span className="block text-xs font-semibold text-slate-800">Images</span>
              <span className="block text-2xs text-slate-500">
                Logos and illustrations the builder can place, up to 512 KB each.
              </span>
            </span>
            <input
              ref={assetInputRef}
              type="file"
              accept={ASSET_TYPES}
              multiple
              className="hidden"
              aria-hidden
              tabIndex={-1}
              onChange={(event) => {
                uploadAssets(event.target.files);
                event.target.value = "";
              }}
            />
            <Button
              size="xs"
              variant="outline"
              onClick={() => assetInputRef.current?.click()}
              disabled={assets.uploadMutation.isPending}
            >
              <ImageIcon className="mr-1 h-3 w-3" />
              Upload
            </Button>
          </div>
          {assets.assets.length === 0 ? (
            <p className="text-2xs text-slate-400">No images yet.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-2">
              {assets.assets.map((asset) => (
                <li
                  key={asset.id ?? asset.name}
                  className="flex items-center gap-2 rounded-md border border-slate-100 p-1.5"
                >
                  <img
                    src={`data:${asset.contentType};base64,${asset.dataBase64 ?? ""}`}
                    alt={asset.name}
                    className="h-8 w-8 shrink-0 rounded bg-slate-50 object-contain"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[10px] text-slate-700">
                      {asset.name}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {Math.max(1, Math.round((asset.sizeBytes ?? 0) / 1024))} KB
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Delete ${asset.name}`}
                    disabled={assets.deleteMutation.isPending || !asset.id}
                    onClick={() => asset.id && assets.deleteMutation.mutate(asset.id)}
                    className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-3">
          <span className="space-y-0.5">
            <span className="block text-xs font-semibold text-slate-800">Offer as a template</span>
            <span className="block text-2xs text-slate-500">
              Builders in this tenant can start new projects from the newest version, instructions,
              theme, and assets. Data connections are not copied.
            </span>
          </span>
          <Switch
            checked={isTemplate}
            onCheckedChange={setIsTemplate}
            disabled={saveMutation.isPending}
            aria-label="Offer as a template"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending || !isColorValid}>
            Save settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
