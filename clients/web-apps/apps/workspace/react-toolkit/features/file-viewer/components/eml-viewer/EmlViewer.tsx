import { ScrollArea } from "@avplatform/ui/scroll";
import { useEffect, useState } from "react";

interface EmlViewerProps {
  fileUrl: string;
}

interface EmlData {
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  bodyHtml?: string;
  bodyText?: string;
}

const EmlViewer = ({ fileUrl }: EmlViewerProps) => {
  const [data, setData] = useState<EmlData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error("Failed to fetch email");
        const text = await res.text();

        if (cancelled) return;

        const parsed = parseEml(text);
        setData(parsed);
        setError(null);
      } catch (err) {
        if (!cancelled) setError("Unable to preview this email.");
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  if (error) {
    return <p className="p-4 text-sm text-muted-foreground">{error}</p>;
  }

  if (!data) {
    return <p className="p-4 text-sm text-muted-foreground">Loading email…</p>;
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-3 p-4">
        <div className="space-y-1 border-b pb-3">
          {data.subject && (
            <h3 className="text-base font-semibold text-foreground">{data.subject}</h3>
          )}
          <dl className="space-y-0.5 text-xs text-muted-foreground">
            {data.from && (
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 font-medium">From</dt>
                <dd className="break-words">{data.from}</dd>
              </div>
            )}
            {data.to && (
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 font-medium">To</dt>
                <dd className="break-words">{data.to}</dd>
              </div>
            )}
            {data.date && (
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 font-medium">Date</dt>
                <dd className="break-words">{data.date}</dd>
              </div>
            )}
          </dl>
        </div>

        {data.bodyHtml ? (
          <div
            className="prose prose-sm max-w-none text-sm text-foreground"
            dangerouslySetInnerHTML={{ __html: data.bodyHtml }}
          />
        ) : (
          <pre className="whitespace-pre-wrap break-words text-sm text-foreground">
            {data.bodyText || "No body content."}
          </pre>
        )}
      </div>
    </ScrollArea>
  );
};

/** Minimal EML parser: extracts headers and the first text/html body part. */
function parseEml(raw: string): EmlData {
  const result: EmlData = {};

  // Split headers from body (first blank line).
  const headerEnd = raw.indexOf("\r\n\r\n");
  const headerBlock = headerEnd >= 0 ? raw.slice(0, headerEnd) : raw;
  const bodyBlock = headerEnd >= 0 ? raw.slice(headerEnd + 4) : "";

  const getHeader = (name: string): string | undefined => {
    const re = new RegExp(`^${name}:\\s*(.*)$`, "im");
    const m = headerBlock.match(re);
    return m?.[1]?.trim();
  };

  result.subject = getHeader("Subject");
  result.from = getHeader("From");
  result.to = getHeader("To");
  result.date = getHeader("Date");

  // Prefer the HTML part if present; otherwise use the plain-text part.
  const htmlMatch = bodyBlock.match(/Content-Type:\s*text\/html[\s\S]*?\r?\n\r?\n([\s\S]*?)(?=\r?\n--|$)/i);
  const textMatch = bodyBlock.match(/Content-Type:\s*text\/plain[\s\S]*?\r?\n\r?\n([\s\S]*?)(?=\r?\n--|$)/i);

  if (htmlMatch?.[1]) {
    result.bodyHtml = htmlMatch[1].trim();
  } else if (textMatch?.[1]) {
    result.bodyText = textMatch[1].trim();
  } else {
    result.bodyText = bodyBlock.trim();
  }

  return result;
}

export default EmlViewer;
