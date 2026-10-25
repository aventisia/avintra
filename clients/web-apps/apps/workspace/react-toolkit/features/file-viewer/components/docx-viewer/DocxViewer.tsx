import { ScrollArea, ScrollBar } from "@avplatform/ui/scroll";
import { renderAsync } from "docx-preview";
import { useEffect, useRef } from "react";

interface DocxViewerProps {
  fileUrl: string;
}

const DocxViewer = ({ fileUrl }: DocxViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      if (!containerRef.current) return;

      try {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error("Failed to fetch document");
        const blob = await res.blob();

        if (cancelled) return;

        // Clear previous content before rendering the new document.
        containerRef.current.innerHTML = "";
        await renderAsync(blob, containerRef.current, undefined, {
          className: "docx",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          experimental: false,
          useBase64URL: true,
        });
      } catch {
        if (!cancelled) {
          containerRef.current!.innerHTML =
            '<p class="text-sm text-muted-foreground p-4">Unable to preview this document.</p>';
        }
      }
    };

    render();

    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [fileUrl]);

  return (
    <ScrollArea className="h-full w-full">
      <div ref={containerRef} className="docx-container mx-auto w-full max-w-3xl bg-white p-4" />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default DocxViewer;
