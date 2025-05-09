import { DataFieldsDto } from "@/features/data-fields/dtos/data-fields-dtos";
import { useFetchDataFields } from "@/features/data-fields/hooks/useFetchDataFields";
import { uploadFile } from "@/features/file-uploader/apis/file-upload-apis";
import { AnnotationDataDto } from "@/features/label-data/dtos/annotation-data-dtos";
import { useFetchAnnotationData } from "@/features/label-data/hooks/useFetchAnnotationData";
import { useUpdateAnnotation } from "@/features/label-data/hooks/useUpdateAnnotation";
import { useUpdateAnnotationSilently } from "@/features/label-data/hooks/useUpdateAnnotationSilently";
import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import PaginatedSelect from "@/features/pdf-previewer/components/PaginationSelect";

import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import html2canvas from "html2canvas";
import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { FileViewerDto } from "../../multi-format-viewer/dtos/file-list-dtos";
import { useFileListStore } from "../../multi-format-viewer/store/pdf-list-store";
import { useDownloadPdf } from "../hooks/useDownloadPdf";
import { useFetchUploadedFiles } from "../hooks/useFetchFiles";
import { useParentWidth } from "../hooks/usePdfWidth";
import { usePdfViewerStore } from "../stores/pdf-previewer-store";
import { addUpdateInString } from "../utils";
import AnnotationBox from "./AnnotationBox";
import ControlPanel from "./ControlPannel";
import FieldSelectionPopover from "./FieldSelectionPopover";
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
  const [isOpen, setIsOpen] = useState(false);

  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const [dataFields, setDataFields] = useState<DataFieldsDto[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [pendingAnnotation, setPendingAnnotation] = useState<Annotation | null>(
    null,
  );
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(
    null,
  );

  const { data } = useFetchDataFields();

  const { data: pdfList, isLoading: isLoadingList } = useFetchUploadedFiles();

  const { data: annotationData } = useFetchAnnotationData();

  const currAnnotationData = annotationData?.data as
    | AnnotationDataDto[]
    | undefined;

  const { mutate: downloadPdf } = useDownloadPdf();

  const { mutate: updateAnnotation } = useUpdateAnnotation();

  const { currAnnotationObj } = useAnnotationDataStore(
    useShallow((state) => ({
      currAnnotationObj: state.currAnnotationObj,
      setAnnotationObject: state.setAnnotationObject,
      annotationDataQueryKey: state.annotationDataQueryKey,
      clearCurrAnnotation: state.clearCurrAnnotation,
      setCurrImg: state.setCurrImg,
      currImg: state.currImg,
    })),
  );

  const { selectedPdf, pdfUrl, setSelectedPdf } = useFileListStore(
    useShallow((state) => ({
      selectedPdf: state.selectedFile,
      pdfUrl: state.fileUrl,
      setSelectedPdf: state.setSelectedFile,
    })),
  );
  useUpdateAnnotationSilently();

  const { pageNumber, scale, rotate, setPageNumber, setNumPages, numPages } =
    usePdfViewerStore(
      useShallow((state) => ({
        pageNumber: state.pageNumber,
        scale: state.scale,
        rotate: state.rotate,
        setPageNumber: state.setPageNumber,
        setNumPages: state.setNumPages,
        numPages: state.numPages,
      })),
    );

  const canvasRef = useRef<HTMLDivElement>(null);

  const parentRef = useRef<HTMLDivElement>(null);

  // Create a ref for the invisible trigger button
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const { width } = useParentWidth(parentRef, 32);

  const handlePdfSelect = (newPdf: FileViewerDto) => {
    setSelectedPdf(newPdf);
    downloadPdf(newPdf.path || "");
    setAnnotations([]);
    setPageNumber(1); // Reset page number when switching PDFs
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
    }
  }, [selectedPdf, downloadPdf, modelId]);

  useEffect(() => {
    if (data?.data) setDataFields(data?.data);
  }, [data?.data]);

  useEffect(() => {
    if (currAnnotationObj) {
      const ann: Annotation[] = JSON.parse(currAnnotationObj);
      setAnnotations(ann);
    }
  }, [currAnnotationObj]);

  const onDocumentLoadSuccess = ({ numPages }: DocumentLoadSuccess) => {
    setNumPages(numPages);
    setPageNumber(1);
    setIsPdfLoading(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x: x / scale, y: y / scale });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const width = currentX / scale - startPos.x;
    const height = currentY / scale - startPos.y;

    setCurrentAnnotation({
      fieldId: Date.now().toString(),
      pageNumber,
      position: {
        x: startPos.x,
        y: startPos.y,
        width,
        height,
      },
    });
  };

  const handleMouseUp = async () => {
    if (
      currentAnnotation &&
      currentAnnotation?.position.height < 8 &&
      currentAnnotation?.position.width < 8
    )
      return;
    //Trigger the popover to open relative to annotation
    if (triggerRef.current && currentAnnotation && canvasRef.current) {
      triggerRef.current.style.position = "absolute";
      triggerRef.current.style.left = `${currentAnnotation?.position.x * scale}px `;
      triggerRef.current.style.top = `${currentAnnotation?.position.y * scale + currentAnnotation?.position.height}px`;

      setIsOpen(true);
    }

    if (currentAnnotation) {
      // If there's already a pending annotation, remove it first
      setPendingAnnotation({
        ...currentAnnotation,
      });

      // Clear any existing annotations to prevent visual overlap
      const fieldToUpdate = dataFields.find((field) =>
        annotations.some(
          (ann) =>
            ann.fieldId === field?.id &&
            isOverlapping(currentAnnotation.position, ann.position),
        ),
      );

      if (fieldToUpdate) {
        // Remove the existing annotation of that type
        setAnnotations(
          annotations.filter((ann) => ann.fieldId !== fieldToUpdate.id),
        );
      }
    }

    setIsDrawing(false);
    setCurrentAnnotation(null);
  };

  // Helper function to check if two annotation areas overlap
  const isOverlapping = (
    pos1: { x: number; y: number; width: number; height: number },
    pos2: { x: number; y: number; width: number; height: number },
  ) => {
    return !(
      pos2.x > pos1.x + pos1.width ||
      pos2.x + pos2.width < pos1.x ||
      pos2.y > pos1.y + pos1.height ||
      pos2.y + pos2.height < pos1.y
    );
  };

  const assignTypeToAnnotation = async (field: DataFieldsDto) => {
    if (pendingAnnotation && field.id && canvasRef.current) {
      // const confidence = calculateConfidence(pendingAnnotation.content, typeId);
      const newAnnotation: Annotation = {
        ...pendingAnnotation,
        fieldId: field.id,
        fieldName: field.name,
        // confidence
      };

      // Remove existing annotation of the same type
      const filteredAnnotations = annotations.filter(
        (ann) => ann.fieldId !== field.id,
      );

      const canvas = await html2canvas(canvasRef.current, {
        x: newAnnotation?.position.x * scale + 1,
        y: newAnnotation?.position.y * scale + 1,
        width: newAnnotation?.position.width * scale - 2,
        height: newAnnotation?.position.height * scale - 2,
        backgroundColor: null,
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
          },
          "image/png",
          0.95,
        );
      }).then();

      // Create a File from the Blob
      const imgFile = new File(
        [blob],
        `${newAnnotation.fieldId}-${selectedPdf?.name}.png`,
        { type: "image/png" },
      );

      try {
        const response = await uploadFile(imgFile);

        const currData = currAnnotationData?.find(
          (item) => item.uploadedDocId === selectedPdf?.id,
        );

        if (response) {
          const currImg = response.data?.data[0]?.path || "";

          updateAnnotation({
            id: currData?.id,
            uploadedDocId: selectedPdf?.id || "",
            mlModelId: selectedPdf?.mlModelId,
            annotationObject: addUpdateInString(
              currData?.annotationObject || "",
              {
                ...newAnnotation,
                imgPath: currImg,
              },
            ),
          });
        }
      } catch (error) {
        toast.error(error?.toString());
        throw error;
      }
      // Add the new annotation
      const newAnnotations = [...filteredAnnotations, newAnnotation];
      setAnnotations(newAnnotations);
      setPendingAnnotation(null);
    }
  };

  if (isLoadingList) {
    return <PdfLoaderTemplate />;
  }

  if (!pdfList?.data?.length) {
    return <div className="p-4 text-center">No PDFs available</div>;
  }

  return (
    <div
      ref={parentRef}
      className="col-span-2 overflow-hidden rounded-lg border bg-white shadow"
    >
      <ControlPanel
        scale={scale}
        numPages={numPages ?? 0}
        pageNumber={pageNumber}
        rotate={rotate}
      />
      <ScrollArea className={`h-[calc(100vh-11.2rem)] w-full p-2`}>
        <div
          ref={canvasRef}
          style={{ position: "relative", width: "100%" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDrawing(false)}
        >
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
          {!isPdfLoading &&
            annotations.map((annotation) => (
              <AnnotationBox annotation={annotation} dataFields={dataFields} />
            ))}
          {currentAnnotation && (
            <AnnotationBox
              annotation={currentAnnotation}
              dataFields={dataFields}
            />
          )}
          {pendingAnnotation && (
            <AnnotationBox
              annotation={pendingAnnotation}
              dataFields={dataFields}
            />
          )}
          <FieldSelectionPopover
            isOpen={isOpen}
            assignTypeToAnnotation={assignTypeToAnnotation}
            dataFields={dataFields}
            setCurrentAnnotation={setCurrentAnnotation}
            setIsOpen={setIsOpen}
            triggerRef={triggerRef}
          />
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
