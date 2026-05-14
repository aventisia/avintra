import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import { useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useShallow } from "zustand/react/shallow";

import { useParentWidth } from "../../hooks/usePdfWidth";
import { useViewerStore } from "../../stores/file-viewer-store";
import { usePdfViewerStore } from "../../stores/pdf-previewer-store";
import PdfLoaderTemplate from "./PdfLoaderTemplate";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();
interface PdfViewerProps {
  fileUrl: string;
}

const PdfViewer = ({ fileUrl }: PdfViewerProps) => {
  // Shared viewer state (zoom / rotate)
  const { scale, rotate } = useViewerStore(
    useShallow((s) => ({ scale: s.scale, rotate: s.rotate })),
  );

  // PDF-specific state (page navigation)
  const { pageNumber, setNumPages, setPageNumber } = usePdfViewerStore(
    useShallow((s) => ({
      pageNumber: s.pageNumber,
      setNumPages: s.setNumPages,
      setPageNumber: s.setPageNumber,
    })),
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const { width } = useParentWidth(parentRef, 32);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  return (
    <div ref={parentRef}>
      <ScrollArea className="h-[calc(100vh-var(--header-height)-3*var(--header-padding)-4rem)] w-full p-2">
        <div style={{ position: "relative", width: "100%" }}>
          <Document
            file={fileUrl}
            error="Failed to load PDF file."
            loading={<PdfLoaderTemplate />}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotate}
              width={width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default PdfViewer;
