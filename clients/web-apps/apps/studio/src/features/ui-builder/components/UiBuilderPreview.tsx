import { cn } from "@avplatform/ui/lib";
import {
  type UiBuilderDataConnection,
  type UiBuilderDataRequest,
  UiBuilderHostFrame,
  type UiBuilderQueryResultEvent,
  type UiBuilderRuntimeError,
} from "@avplatform/ui/ui-builder-host";
import { SparkleIcon } from "@phosphor-icons/react";
import { useCallback } from "react";

import {
  UI_BUILDER_BRIDGE_SOURCE,
  UI_BUILDER_SELECTION_MESSAGE_TYPE,
} from "../constants/ui-builder-selection.constant";
import { type UiBuilderSelection } from "../types/ui-builder-selection.type";
import { type UiBuilderDevice } from "./UiBuilderPreviewToolbar";

type UiBuilderPreviewProps = {
  html: string;
  title: string;
  device: UiBuilderDevice;
  reloadKey: number;
  isGenerating: boolean;
  bridgeEnabled?: boolean;
  onSelection?: (selection: UiBuilderSelection) => void;
  connections: UiBuilderDataConnection[];
  onDataRequest: (request: UiBuilderDataRequest) => Promise<unknown>;
  onRuntimeError: (error: UiBuilderRuntimeError) => void;
  onQueryResult: (event: UiBuilderQueryResultEvent) => void;
  assets?: Record<string, string>;
};

const MAX_BRIDGE_FIELD_LENGTH = 8192;

const DEVICE_WIDTHS: Record<UiBuilderDevice, string> = {
  desktop: "100%",
  tablet: "820px",
  mobile: "390px",
};

const isUiBuilderSelectionMessage = (
  data: unknown,
): data is { selector: string; outerHtml: string; textContent: string; sourceId?: string } => {
  if (!data || typeof data !== "object") return false;

  const candidate = data as Record<string, unknown>;
  if (candidate.source !== UI_BUILDER_BRIDGE_SOURCE) return false;
  if (candidate.type !== UI_BUILDER_SELECTION_MESSAGE_TYPE) return false;
  if (typeof candidate.selector !== "string" || !candidate.selector) return false;
  if (typeof candidate.outerHtml !== "string" || !candidate.outerHtml) return false;
  if (typeof candidate.textContent !== "string") return false;
  if (candidate.selector.length > MAX_BRIDGE_FIELD_LENGTH) return false;
  if (candidate.outerHtml.length > MAX_BRIDGE_FIELD_LENGTH) return false;
  if (candidate.textContent.length > MAX_BRIDGE_FIELD_LENGTH) return false;
  if (candidate.sourceId !== undefined && !/^\d{1,6}$/.test(String(candidate.sourceId)))
    return false;

  return true;
};

const GeneratingOverlay = () => (
  <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/40 pt-6 backdrop-blur-[1px]">
    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/90 px-3 py-1.5 text-2xs font-medium text-indigo-700 shadow-lg shadow-indigo-500/10">
      <SparkleIcon className="h-3.5 w-3.5 animate-pulse" />
      The agent is building the next version…
    </div>
  </div>
);

const EmptyCanvas = ({ isGenerating }: { isGenerating: boolean }) => (
  <div className="flex h-full w-full items-center justify-center p-8">
    <div className="w-full max-w-md space-y-4">
      {isGenerating ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
          </div>
          <p className="pt-1 text-center text-2xs font-medium text-indigo-600">
            Drafting your first version…
          </p>
        </div>
      ) : (
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-400">
            <SparkleIcon className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-700">Your interface will appear here</p>
          <p className="text-2xs text-slate-500">
            It runs live in a secure sandbox, connected to your data.
          </p>
        </div>
      )}
    </div>
  </div>
);

/** Device-framed live preview of the current version on a canvas. */
export const UiBuilderPreview = ({
  html,
  title,
  device,
  reloadKey,
  isGenerating,
  bridgeEnabled = false,
  onSelection,
  connections,
  onDataRequest,
  onRuntimeError,
  onQueryResult,
  assets,
}: UiBuilderPreviewProps) => {
  const handleFrameMessage = useCallback(
    (data: unknown) => {
      if (!bridgeEnabled || !isUiBuilderSelectionMessage(data)) return;
      onSelection?.({
        selector: data.selector,
        outerHtml: data.outerHtml,
        textContent: data.textContent,
        sourceId: data.sourceId === undefined ? undefined : String(data.sourceId),
      });
    },
    [bridgeEnabled, onSelection],
  );

  const isFramed = device !== "desktop";

  return (
    <div className="relative h-full w-full overflow-auto bg-slate-100 bg-[radial-gradient(circle,_rgb(203_213_225)_1px,_transparent_1px)] [background-size:16px_16px]">
      {!html.trim() ? (
        <EmptyCanvas isGenerating={isGenerating} />
      ) : (
        <div className={cn("flex h-full w-full justify-center", isFramed ? "p-6" : "p-3")}>
          <div
            className={cn(
              "relative h-full overflow-hidden bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 transition-[width] duration-300",
              isFramed ? "rounded-[28px] border-[6px] border-slate-900" : "rounded-xl",
            )}
            style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%" }}
          >
            {isGenerating && <GeneratingOverlay />}
            <UiBuilderHostFrame
              key={reloadKey}
              html={html}
              title={title}
              connections={connections}
              onDataRequest={onDataRequest}
              onRuntimeError={onRuntimeError}
              onQueryResult={onQueryResult}
              onFrameMessage={handleFrameMessage}
              assets={assets}
              className="h-full w-full border-0 bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};
