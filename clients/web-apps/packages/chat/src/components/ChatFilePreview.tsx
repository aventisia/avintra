import { Skeleton } from "@avplatform/ui";
import {
  ArrowSquareOutIcon,
  CodeIcon,
  DownloadSimpleIcon,
  EyeIcon,
  XIcon,
} from "@phosphor-icons/react";
import { type ComponentProps, useState } from "react";
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

type ChatFilePreviewProps = {
  file: ChatPreviewFile | null;
  isLoading: boolean;
  onClose: () => void;
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
export const ChatFilePreview = ({ file, isLoading, onClose }: ChatFilePreviewProps) => {
  const loadable = file?.url ? { ...file, url: file.url } : null;
  const language = loadable && SOURCE_LANGUAGES[loadable.contentType.toLowerCase()];
  const source = language ? readDataUrl(loadable.url) : null;
  const [sourceShownFor, setSourceShownFor] = useState<string | null>(null);
  const showsSource = source !== null && sourceShownFor === loadable?.url;
  const fileBody = showsSource ? (
    <ChatCodeBlock components={SOURCE_COMPONENTS} language={language!} code={source} />
  ) : (
    loadable && renderFileBody(loadable)
  );

  return (
    <section
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
        {loadable && (
          <>
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
        <ChatIconButton label="Close preview" onClick={onClose}>
          <XIcon />
        </ChatIconButton>
      </header>
      <div className="min-h-0 flex-1">
        {isLoading ? (
          <div role="status" aria-label="Loading preview" className="space-y-3 p-6">
            <Skeleton className="h-6 w-1/2 rounded" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : (
          fileBody || (
            <p className="p-6 text-sm text-muted-foreground">
              {loadable
                ? "This file can't be previewed here. Download it to open it."
                : "This file can't be previewed."}
            </p>
          )
        )}
      </div>
    </section>
  );
};
