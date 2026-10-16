import { Button } from "@avplatform/ui/buttons";
import { MousePointer2, PencilLine } from "lucide-react";

import { type UiBuilderContentFormat } from "../constants/ui-builder-framework.constant";

type UiBuilderViewMode = "preview" | "code";

type UiBuilderPreviewToolbarProps = {
  selectMode: boolean;
  onSelectModeChange: (selectMode: boolean) => void;
  hasSelection: boolean;
  onEditText: () => void;
  editTextDisabledReason?: string;
  format: UiBuilderContentFormat;
  onFormatChange: (format: UiBuilderContentFormat) => void;
  viewMode: UiBuilderViewMode;
  onViewModeChange: (viewMode: UiBuilderViewMode) => void;
  disabled: boolean;
};

/** Preview-pane toolbar: element select, manual text edit, output format, and preview/code toggle. */
export const UiBuilderPreviewToolbar = ({
  selectMode,
  onSelectModeChange,
  hasSelection,
  onEditText,
  editTextDisabledReason,
  format,
  onFormatChange,
  viewMode,
  onViewModeChange,
  disabled,
}: UiBuilderPreviewToolbarProps) => (
  <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-1.5">
    <div className="flex items-center gap-1">
      <Button
        size="xs"
        variant={selectMode ? "default" : "ghost"}
        aria-pressed={selectMode}
        disabled={disabled}
        onClick={() => onSelectModeChange(!selectMode)}
        className="gap-1.5"
      >
        <MousePointer2 className="h-3.5 w-3.5" />
        Select
      </Button>
      <Button
        size="xs"
        variant="ghost"
        disabled={disabled || !hasSelection || Boolean(editTextDisabledReason)}
        title={editTextDisabledReason}
        onClick={onEditText}
        className="gap-1.5"
      >
        <PencilLine className="h-3.5 w-3.5" />
        Edit Text
      </Button>

      <div className="ml-1 flex items-center rounded-md border border-slate-200 bg-white p-0.5">
        <Button
          size="xs"
          variant={format === "html" ? "secondary" : "ghost"}
          aria-pressed={format === "html"}
          disabled={disabled}
          onClick={() => onFormatChange("html")}
          className="h-6 rounded-sm px-2"
        >
          HTML
        </Button>
        <Button
          size="xs"
          variant={format === "framework" ? "secondary" : "ghost"}
          aria-pressed={format === "framework"}
          disabled={disabled}
          onClick={() => onFormatChange("framework")}
          className="h-6 rounded-sm px-2"
        >
          React
        </Button>
      </div>
    </div>

    <div className="flex items-center rounded-md border border-slate-200 bg-white p-0.5">
      <Button
        size="xs"
        variant={viewMode === "preview" ? "secondary" : "ghost"}
        aria-pressed={viewMode === "preview"}
        disabled={disabled}
        onClick={() => onViewModeChange("preview")}
        className="h-6 rounded-sm px-2"
      >
        Preview
      </Button>
      <Button
        size="xs"
        variant={viewMode === "code" ? "secondary" : "ghost"}
        aria-pressed={viewMode === "code"}
        disabled={disabled}
        onClick={() => onViewModeChange("code")}
        className="h-6 rounded-sm px-2"
      >
        Code
      </Button>
    </div>
  </div>
);
