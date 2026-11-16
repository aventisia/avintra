import { JsonViewer, createCopyJsonAction } from "@avplatform/ui/json-viewer";
import { useMemo } from "react";

const isJson = (value: string) => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Tool's OpenAPI specification: a JSON tree, or plain text for YAML.
 */
export const ToolSpecification = ({ spec }: { spec: string }) => {
  const isJsonSpec = useMemo(() => isJson(spec), [spec]);

  return (
    <section className="overflow-hidden rounded-lg bg-surface ring-1 ring-line">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <p className="font-mono text-label uppercase text-muted-foreground">
          OpenAPI · {isJsonSpec ? "JSON" : "YAML"}
        </p>
        {createCopyJsonAction(spec)}
      </div>
      <div className="px-3 py-1">
        {isJsonSpec ? (
          <JsonViewer
            jsonData={spec}
            viewportClassName="max-h-[40rem]"
            shortenTextAfterLength={120}
          />
        ) : (
          <pre className="max-h-[40rem] overflow-auto py-2 font-mono text-[12px] leading-5 text-ink-2">
            {spec}
          </pre>
        )}
      </div>
    </section>
  );
};
