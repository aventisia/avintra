import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import {
  Code2,
  Database,
  Eye,
  Monitor,
  MousePointer2,
  PencilLine,
  RotateCw,
  Smartphone,
  Tablet,
} from "lucide-react";
import { type ReactNode } from "react";

import { type UiBuilderContentFormat } from "../constants/ui-builder-framework.constant";

/** Preview pane display mode. */
export type UiBuilderViewMode = "preview" | "code";

/** Device width the preview is framed at. */
export type UiBuilderDevice = "desktop" | "tablet" | "mobile";

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
  device: UiBuilderDevice;
  onDeviceChange: (device: UiBuilderDevice) => void;
  onReload: () => void;
  connectionCount: number;
  onOpenData: () => void;
  disabled: boolean;
  isFormatLocked: boolean;
};

const Segment = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center rounded-lg bg-slate-100 p-0.5">{children}</div>
);

const SegmentButton = ({
  active,
  label,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <Tooltip content={label}>
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-md px-2 text-2xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800",
      )}
    >
      {children}
    </button>
  </Tooltip>
);

const ToolButton = ({
  active,
  label,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <Tooltip content={label}>
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-2xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      {children}
    </button>
  </Tooltip>
);

/** Preview-pane toolbar: element tools, device frame, data, output format, and preview/code. */
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
  device,
  onDeviceChange,
  onReload,
  connectionCount,
  onOpenData,
  disabled,
  isFormatLocked,
}: UiBuilderPreviewToolbarProps) => (
  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-3 py-1.5 backdrop-blur">
    <div className="flex items-center gap-1">
      <ToolButton
        active={selectMode}
        label="Select an element to change it"
        disabled={disabled || viewMode === "code"}
        onClick={() => onSelectModeChange(!selectMode)}
      >
        <MousePointer2 className="h-3.5 w-3.5" />
        Select
      </ToolButton>
      <ToolButton
        label={editTextDisabledReason ?? "Edit the selected element's text"}
        disabled={disabled || !hasSelection || Boolean(editTextDisabledReason)}
        onClick={onEditText}
      >
        <PencilLine className="h-3.5 w-3.5" />
        Edit text
      </ToolButton>
      <span className="mx-1 h-4 w-px bg-slate-200" />
      <ToolButton label="Data connections" onClick={onOpenData}>
        <Database className="h-3.5 w-3.5" />
        Data
        {connectionCount > 0 && (
          <span className="rounded-full bg-emerald-100 px-1.5 text-[10px] font-semibold text-emerald-700">
            {connectionCount}
          </span>
        )}
      </ToolButton>
    </div>

    <div className="flex items-center gap-1.5">
      <Segment>
        <SegmentButton
          active={device === "desktop"}
          label="Desktop"
          disabled={viewMode === "code"}
          onClick={() => onDeviceChange("desktop")}
        >
          <Monitor className="h-3.5 w-3.5" />
        </SegmentButton>
        <SegmentButton
          active={device === "tablet"}
          label="Tablet"
          disabled={viewMode === "code"}
          onClick={() => onDeviceChange("tablet")}
        >
          <Tablet className="h-3.5 w-3.5" />
        </SegmentButton>
        <SegmentButton
          active={device === "mobile"}
          label="Mobile"
          disabled={viewMode === "code"}
          onClick={() => onDeviceChange("mobile")}
        >
          <Smartphone className="h-3.5 w-3.5" />
        </SegmentButton>
      </Segment>
      <Tooltip content="Reload preview">
        <button
          type="button"
          aria-label="Reload preview"
          disabled={disabled || viewMode === "code"}
          onClick={onReload}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>
      </Tooltip>
      <span className="mx-0.5 h-4 w-px bg-slate-200" />
      <Segment>
        <SegmentButton
          active={format === "framework"}
          label={
            isFormatLocked
              ? "Output format is locked while generating"
              : "React: interactive component (recommended)"
          }
          disabled={isFormatLocked}
          onClick={() => onFormatChange("framework")}
        >
          React
        </SegmentButton>
        <SegmentButton
          active={format === "html"}
          label={
            isFormatLocked ? "Output format is locked while generating" : "HTML: single document"
          }
          disabled={isFormatLocked}
          onClick={() => onFormatChange("html")}
        >
          HTML
        </SegmentButton>
      </Segment>
      <Segment>
        <SegmentButton
          active={viewMode === "preview"}
          label="Preview"
          disabled={disabled}
          onClick={() => onViewModeChange("preview")}
        >
          <Eye className="h-3.5 w-3.5" />
        </SegmentButton>
        <SegmentButton
          active={viewMode === "code"}
          label="Code"
          disabled={disabled}
          onClick={() => onViewModeChange("code")}
        >
          <Code2 className="h-3.5 w-3.5" />
        </SegmentButton>
      </Segment>
    </div>
  </div>
);
