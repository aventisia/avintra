import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import { useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useShallow } from "zustand/react/shallow";

import { useParentWidth } from "../../hooks/usePdfWidth";
import { usePdfViewerStore } from "../../stores/pdf-previewer-store";
import PdfLoaderTemplate from "./PdfLoaderTemplate";

pdfjs.GlobalWorkerOptions.workerSrc = "assets/pdf.worker.min.mjs";

export const PdfViewer = ({ fileUrl }: { fileUrl: string }) => {
  const { pageNumber, scale, rotate, setPageNumber, setNumPages, setRotate } =
    usePdfViewerStore(
      useShallow((state) => ({
        pageNumber: state.pageNumber,
        scale: state.scale,
        rotate: state.rotate,
        setPageNumber: state.setPageNumber,
        setNumPages: state.setNumPages,
        setRotate: state.setRotate,
      })),
    );

  const canvasRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const { width } = useParentWidth(parentRef, 32);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setRotate(0);
  };

  return (
    <div ref={parentRef}>
      <ScrollArea className="h-[calc(100vh-var(--header-height)-2*var(--header-padding)-4rem)] w-full p-2">
        <div ref={canvasRef} style={{ position: "relative", width: "100%" }}>
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
