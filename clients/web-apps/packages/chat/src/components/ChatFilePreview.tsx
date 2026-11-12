import { Skeleton } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import {
  ArrowSquareOutIcon,
  CodeIcon,
  CornersInIcon,
  CornersOutIcon,
  DownloadSimpleIcon,
  EyeIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  PencilSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { type ComponentProps, type RefObject, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { chatProseComponents } from "../constants/chat-prose.constant";
import { formatFileSize, parseDelimited, readDataUrl } from "../utils/chat-file.util";
import { ChatCodeBlock } from "./ChatCodeBlock";
import { ChatCopyButton } from "./ChatCopyButton";
import { ChatIconButton } from "./ChatIconButton";

export type ChatPreviewFile = {
  name: string;
  contentType: string;
  sizeBytes: number;
  /** A URL the browser can load, such as a data: URL; null when the file can't be shown. */
  url: string | null;
};

export type ChatPreviewVersion = {
  id: string;
  versionNumber: number;
};

type ChatFilePreviewProps = {
  file: ChatPreviewFile | null;
  isLoading: boolean;
  onClose: () => void;
  /** Older and newer versions of the same file, by version number; the switcher hides for a single version. */
  versions?: ChatPreviewVersion[];
  /** ID of the version currently shown. */
  activeVersionId?: string;
  onSelectVersion?: (id: string) => void;
  /** Saves edited text as a new version; without it no edit button is shown. */
  onSaveVersion?: (body: string) => void | Promise<unknown>;
  /** True while the edited text is being saved. */
  isSavingVersion?: boolean;
};

const linkClassName =
  "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus [&_svg]:size-4";

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );

// IMPORTANT NOTE: generated files are untrusted; HTML only ever runs in a sandbox without same-origin access.
const SANDBOX = "allow-scripts";

const FILL = "position:fixed;inset:0;width:100%;height:100%;border:0";

const standalonePage = (file: ChatPreviewFile & { url: string }, body: string | null) => {
  const content = file.contentType.startsWith("image/")
    ? `<img src="${escapeHtml(file.url)}" alt="${escapeHtml(file.name)}" style="max-width:100%">`
    : file.contentType === "application/pdf"
      ? `<iframe src="${escapeHtml(file.url)}" style="${FILL}"></iframe>`
      : file.contentType === "text/html" && body !== null
        ? `<iframe sandbox="${SANDBOX}" srcdoc="${escapeHtml(body)}" style="${FILL}"></iframe>`
        : `<pre style="white-space:pre-wrap;font:13px/1.5 ui-monospace,monospace">${escapeHtml(body ?? "")}</pre>`;
  return `<!doctype html><meta charset="utf-8"><title>${escapeHtml(file.name)}</title><body style="margin:16px">${content}`;
};

const pointAtStandalonePage = (
  link: HTMLAnchorElement,
  file: ChatPreviewFile & { url: string },
) => {
  const pageUrl = URL.createObjectURL(
    new Blob([standalonePage(file, readDataUrl(file.url))], { type: "text/html" }),
  );
  link.href = pageUrl;
  setTimeout(() => URL.revokeObjectURL(pageUrl), 60_000);
};

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const useIsFullscreen = (ref: RefObject<HTMLElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const sync = () => setIsFullscreen(!!ref.current && document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [ref]);
  return isFullscreen;
};

const SOURCE_LANGUAGES: Record<string, string> = {
  "text/html": "html",
  "image/svg+xml": "xml",
  "text/csv": "csv",
  "text/tab-separated-values": "tsv",
  "text/markdown": "markdown",
  "application/json": "json",
  "application/xml": "xml",
};

const SourcePre = (props: ComponentProps<"pre">) => (
  <pre {...props} className="h-full overflow-auto p-6 font-mono text-[13px] leading-6 text-ink" />
);

const SourceCode = (props: ComponentProps<"code">) => <code {...props} />;

const SOURCE_COMPONENTS = { Pre: SourcePre, Code: SourceCode };

const DelimitedTable = ({ rows }: { rows: string[][] }) => {
  const [head = [], ...body] = rows;
  return (
    <div className="h-full overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-sunken">
          <tr>
            {head.map((cell, i) => (
              <th
                key={i}
                className="whitespace-nowrap border-b border-line px-3 py-2 text-left font-medium"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r} className="border-b border-line last:border-b-0">
              {row.map((cell, c) => (
                <td key={c} className="px-3 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const renderFileBody = (file: ChatPreviewFile & { url: string }) => {
  const body = readDataUrl(file.url);
  const type = file.contentType.toLowerCase();

  if (type.startsWith("image/"))
    return (
      <div className="flex h-full items-center justify-center overflow-auto p-6">
        <img src={file.url} alt={file.name} className="max-h-full max-w-full" />
      </div>
    );
  if (type === "application/pdf")
    return <iframe src={file.url} title={file.name} className="size-full border-0" />;
  if (body === null) return null;
  if (type === "text/html")
    return (
      <iframe
        srcDoc={body}
        title={file.name}
        sandbox={SANDBOX}
        className="size-full border-0 bg-white"
      />
    );
  if (type === "text/csv" || type === "text/tab-separated-values")
    return <DelimitedTable rows={parseDelimited(body, type === "text/csv" ? "," : "\t")} />;
  if (type === "text/markdown")
    return (
      <div className="h-full overflow-auto px-6 py-5 text-sm leading-6 text-ink">
        <Markdown remarkPlugins={[remarkGfm]} components={chatProseComponents}>
          {body}
        </Markdown>
      </div>
    );
  if (type.startsWith("text/") || type === "application/json" || type === "application/xml")
    return (
      <pre className="h-full overflow-auto whitespace-pre-wrap break-words p-6 font-mono text-[13px] leading-6 text-ink">
        {body}
      </pre>
    );
  return null;
};

/** A generated file: rendered by type in a sandbox, with its source and copy for text files, download, open in a new tab and close. */
export const ChatFilePreview = ({
  file,
  isLoading,
  onClose,
  versions = [],
  activeVersionId,
  onSelectVersion,
  onSaveVersion,
  isSavingVersion,
}: ChatFilePreviewProps) => {
  const loadable = file?.url ? { ...file, url: file.url } : null;
  const language = loadable && SOURCE_LANGUAGES[loadable.contentType.toLowerCase()];
  const body = loadable ? readDataUrl(loadable.url) : null;
  const source = language && body !== null ? body : null;
  const canEdit =
    !!onSaveVersion &&
    !!loadable &&
    body !== null &&
    (loadable.contentType.toLowerCase().startsWith("text/") || !!language);
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => {
    setDraft(null);
  }, [loadable?.url]);
  const isEditing = draft !== null && canEdit;
  const saveDraft = () => {
    if (draft !== null) void onSaveVersion?.(draft);
  };
  const [sourceShownFor, setSourceShownFor] = useState<string | null>(null);
  const showsSource = source !== null && sourceShownFor === loadable?.url;
  const [zoomFor, setZoomFor] = useState({ url: "", index: ZOOM_LEVELS.indexOf(1) });
  const zoomIndex = zoomFor.url === loadable?.url ? zoomFor.index : ZOOM_LEVELS.indexOf(1);
  const zoom = ZOOM_LEVELS[zoomIndex]!;
  const zoomTo = (index: number) => setZoomFor({ url: loadable!.url, index });
  const sectionRef = useRef<HTMLElement>(null);
  const isFullscreen = useIsFullscreen(sectionRef);
  const toggleFullscreen = () =>
    void (
      isFullscreen ? document.exitFullscreen() : sectionRef.current?.requestFullscreen()
    )?.catch(() => {});
  const fileBody = showsSource ? (
    <ChatCodeBlock components={SOURCE_COMPONENTS} language={language!} code={source} />
  ) : (
    loadable && renderFileBody(loadable)
  );

  return (
    <section
      ref={sectionRef}
      aria-label={file ? `Preview of ${file.name}` : "File preview"}
      className="flex h-full min-h-0 flex-col bg-surface dark:bg-bg"
    >
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line pl-4 pr-2">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-medium text-ink">
            {file?.name ?? (isLoading ? "Loading file…" : "File unavailable")}
          </h2>
        </div>
        {file && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatFileSize(file.sizeBytes)}
          </span>
        )}
        {versions.length > 1 && (
          <select
            value={activeVersionId ?? ""}
            onChange={(event) => onSelectVersion?.(event.target.value)}
            aria-label="Artifact version"
            title="Artifact version"
            className="h-8 shrink-0 rounded-lg border border-line bg-surface px-1 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-focus"
          >
            {[...versions]
              .sort((a, b) => a.versionNumber - b.versionNumber)
              .map((version) => (
                <option key={version.id} value={version.id}>
                  v{version.versionNumber}
                </option>
              ))}
          </select>
        )}
        {source !== null && (
          <>
            <ChatIconButton
              label={showsSource ? "Show preview" : "Show code"}
              onClick={() => setSourceShownFor(showsSource ? null : loadable!.url)}
            >
              {showsSource ? <EyeIcon /> : <CodeIcon />}
            </ChatIconButton>
            <ChatCopyButton text={source} label="Copy code" />
          </>
        )}
        {isEditing ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button size="sm" disabled={isSavingVersion || draft === body} onClick={saveDraft}>
              {isSavingVersion ? "Saving…" : "Save as new version"}
            </Button>
          </>
        ) : (
          <>
            {canEdit && (
              <ChatIconButton label="Edit file" onClick={() => setDraft(body)}>
                <PencilSimpleIcon />
              </ChatIconButton>
            )}
            {loadable && (
              <>
                <div className="hidden items-center sm:flex">
                  <ChatIconButton
                    label="Zoom out"
                    disabled={zoomIndex === 0}
                    onClick={() => zoomTo(zoomIndex - 1)}
                  >
                    <MagnifyingGlassMinusIcon />
                  </ChatIconButton>
                  <button
                    type="button"
                    aria-label="Reset zoom"
                    title="Reset zoom"
                    onClick={() => zoomTo(ZOOM_LEVELS.indexOf(1))}
                    className="h-8 min-w-11 rounded-lg px-1 text-xs tabular-nums text-muted-foreground transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <ChatIconButton
                    label="Zoom in"
                    disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                    onClick={() => zoomTo(zoomIndex + 1)}
                  >
                    <MagnifyingGlassPlusIcon />
                  </ChatIconButton>
                </div>
                {document.fullscreenEnabled && (
                  <ChatIconButton
                    label={isFullscreen ? "Exit full screen" : "Full screen"}
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <CornersInIcon /> : <CornersOutIcon />}
                  </ChatIconButton>
                )}
                <a
                  href={loadable.url}
                  download={loadable.name}
                  aria-label={`Download ${loadable.name}`}
                  title="Download"
                  className={linkClassName}
                >
                  <DownloadSimpleIcon />
                </a>
                <a
                  href="about:blank"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => pointAtStandalonePage(event.currentTarget, loadable)}
                  aria-label={`Open ${loadable.name} in a new tab`}
                  title="Open in new tab"
                  className={linkClassName}
                >
                  <ArrowSquareOutIcon />
                </a>
              </>
            )}
          </>
        )}
        <ChatIconButton label="Close preview" onClick={onClose}>
          <XIcon />
        </ChatIconButton>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div role="status" aria-label="Loading preview" className="space-y-3 p-6">
            <Skeleton className="h-6 w-1/2 rounded" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : isEditing ? (
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label={`Edit ${file?.name ?? "file"}`}
            spellCheck={false}
            className="h-full w-full resize-none bg-surface p-6 font-mono text-[13px] leading-6 text-ink focus:outline-none"
          />
        ) : fileBody ? (
          <div
            className="origin-top-left"
            style={{
              width: `${100 / zoom}%`,
              height: `${100 / zoom}%`,
              transform: zoom === 1 ? undefined : `scale(${zoom})`,
            }}
          >
            {fileBody}
          </div>
        ) : (
          <p className="p-6 text-sm text-muted-foreground">
            {loadable
              ? "This file can't be previewed here. Download it to open it."
              : "This file can't be previewed."}
          </p>
        )}
      </div>
    </section>
  );
};
