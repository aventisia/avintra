import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import PaginatedSelect from "@/features/pdf-previewer/components/PaginationSelect";

import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useShallow } from "zustand/react/shallow";

import { FileViewerDto } from "../../multi-format-viewer/dtos/file-list-dtos";
import { useDownloadFile } from "../../multi-format-viewer/hooks/useDownloadFile";
import { useFetchUploadedFiles } from "../../multi-format-viewer/hooks/useFetchFiles";
import { useFileListStore } from "../../multi-format-viewer/store/file-list-store";
import { useParentWidth } from "../hooks/usePdfWidth";
import { usePdfViewerStore } from "../stores/pdf-previewer-store";
import ControlPanel from "./ControlPannel";
import PdfLoaderTemplate from "./PdfLoaderTemplate";

//Define pdfjs worker file path
pdfjs.GlobalWorkerOptions.workerSrc = "assets/pdf.worker.min.js";

export interface DocumentLoadSuccess {
  numPages: number;
}

export interface Annotation {
  fieldId: string;
  pageNumber: number;
  fieldName?: string;
  value?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  imgPath?: string | undefined;
}

export const PdfPreviewer: React.FC = () => {
  //Field selection popover state

  const [isPdfLoading, setIsPdfLoading] = useState(true);

  const { data: pdfList, isLoading: isLoadingList } = useFetchUploadedFiles();

  const { mutate: downloadPdf } = useDownloadFile();

  const { selectedPdf, pdfUrl, setSelectedPdf } = useFileListStore(
    useShallow((state) => ({
      selectedPdf: state.selectedFile,
      pdfUrl: state.fileUrl,
      setSelectedPdf: state.setSelectedFile,
    })),
  );

  const {
    pageNumber,
    scale,
    rotate,
    setPageNumber,
    setNumPages,
    numPages,
    setRotate,
  } = usePdfViewerStore(
    useShallow((state) => ({
      pageNumber: state.pageNumber,
      scale: state.scale,
      rotate: state.rotate,
      setPageNumber: state.setPageNumber,
      setNumPages: state.setNumPages,
      setRotate: state.setRotate,
      numPages: state.numPages,
    })),
  );

  const canvasRef = useRef<HTMLDivElement>(null);

  const parentRef = useRef<HTMLDivElement>(null);

  // Create a ref for the invisible trigger button

  const { width } = useParentWidth(parentRef, 32);

  const handlePdfSelect = (newPdf: FileViewerDto) => {
    setSelectedPdf(newPdf);
    downloadPdf(newPdf.path || "");
    setPageNumber(1); // Reset page number when switching PDFs
    setIsPdfLoading(false);
  };

  // Get model data store state and actions
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );

  //Update UI on model id change
  useEffect(() => {
    let load = true;

    return () => {
      if (load) load = false;
    };
  }, [modelId]);

  // Load initial PDF
  useEffect(() => {
    if (selectedPdf) {
      downloadPdf(selectedPdf.path || "");
      setIsPdfLoading(false);
    }
  }, [selectedPdf, downloadPdf, modelId, setRotate]);

  const onDocumentLoadSuccess = ({ numPages }: DocumentLoadSuccess) => {
    setNumPages(numPages);
    setPageNumber(1);
    setIsPdfLoading(false);
    setRotate(0);
  };

  if (isLoadingList || isPdfLoading) {
    return <PdfLoaderTemplate />;
  }

  if (!pdfList?.data?.length) {
    return <div className="p-4 text-center">No PDFs available</div>;
  }

  return (
    <div
      ref={parentRef}
      className="overflow-hidden rounded-lg border bg-white shadow"
    >
      <ControlPanel
        scale={scale}
        numPages={numPages ?? 0}
        pageNumber={pageNumber}
        rotate={rotate}
      />
      <ScrollArea className={`h-[calc(100vh-11.2rem)] w-full p-2`}>
        <div ref={canvasRef} style={{ position: "relative", width: "100%" }}>
          <Document
            file={pdfUrl}
            // options={options}
            error=""
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
      <PaginatedSelect
        pdfList={pdfList?.data}
        selectedPdf={selectedPdf || pdfList?.data[0]}
        onPdfSelect={handlePdfSelect}
      />
    </div>
  );
};
